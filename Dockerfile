# --- Production Stage ---
# This stage creates the final, lean image for production.
FROM node:20-slim AS production

# Set working directory
WORKDIR /app

# Copy package files 
COPY package*.json ./

# Adicionar ESTA LINHA: Copiar o diretório 'prisma' para o estágio de production
# Isso garante que o 'schema.prisma' esteja presente quando o 'postinstall' do Prisma rodar.
COPY prisma ./prisma/

# Install only production dependencies. The 'postinstall' script will run 'npx prisma generate'.
RUN npm install --omit=dev

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# NOTA: A linha abaixo é redundante após a alteração acima, 
# mas não causa erro. Deixe-a ou remova-a. Se for removida, o Prisma 
# ainda funcionará, mas o arquivo 'schema.prisma' em si não será copiado
# após a geração do cliente. Vamos mantê-lo para ter o schema no runtime.
# COPY --from=builder /app/prisma/schema.prisma ./prisma/schema.prisma


# Expose the port the application will run on
# The server runs on PORT 4000 by default (from src/server.ts)
EXPOSE 4000

# Command to run the application using the start script from package.json
CMD ["npm", "start"]