# 1️⃣ Imagem base: node:20-alpine
FROM node:20-alpine

# 2️⃣ Instalação de dependências do sistema
RUN apk add --no-cache openssl

# 3️⃣ Diretório de trabalho
WORKDIR /app

# 4️⃣ Copia apenas os manifests para aproveitar o cache do Docker
COPY package*.json ./

# 4.1️⃣ Copia também o schema do Prisma antes do npm install
COPY prisma ./prisma

# 5️⃣ Instala todas as dependências (incluindo devDependencies)
# O script postinstall vai rodar o 'prisma generate' aqui.
RUN npm install

# 6️⃣ Copia todo o código-fonte para dentro do container
COPY . .

# 7️⃣ Gera o cliente do Prisma (extra segurança)
RUN npx prisma generate

# 8️⃣ Compila TypeScript
RUN npm run build

# 9️⃣ Remove dependências de desenvolvimento
RUN npm prune --production

# 🔟 Expõe a porta da aplicação
EXPOSE 4000

# 1️⃣1️⃣ Comando para iniciar
CMD ["npm", "run", "start"]
