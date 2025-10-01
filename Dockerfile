# 1️⃣ Imagem base: node:20-alpine
# Imagem muito leve para reduzir o tamanho final
FROM node:20-alpine

# 2️⃣ Instalação de dependências do sistema
# O Prisma requer 'openssl' para funcionar no runtime.
RUN apk add --no-cache openssl

# 3️⃣ Diretório de trabalho
WORKDIR /app

# 4️⃣ Copia apenas os manifests para aproveitar o cache do Docker
COPY package*.json ./

# 5️⃣ Instala todas as dependências (incluindo devDependencies)
# O script postinstall vai rodar o 'prisma generate' aqui.
RUN npm install

# 6️⃣ Copia todo o código-fonte para dentro do container
COPY . .

# 7️⃣ Gera o cliente do Prisma (se o postinstall falhar ou para garantir)
# Se já rodou no 'npm install', será rápido. Se não, garante a geração.
RUN npx prisma generate

# 8️⃣ Compila TypeScript
RUN npm run build

# 9️⃣ Limpa dependências de desenvolvimento
# Remove arquivos e dependências desnecessárias para reduzir o tamanho final da imagem.
RUN npm prune --production

# 🔟 Expõe a porta que a aplicação vai usar
EXPOSE 4000

# 1️⃣1️⃣ Comando para iniciar a aplicação
CMD ["npm", "run", "start"]