 # NativeSpeak API

API REST para o aplicativo NativeSpeak, construída com Express, Prisma, JWT e **MongoDB**.

---

## 📋 Pré-requisitos

- **Node.js 18+** - **npm** ou **yarn**
- **Banco de dados MongoDB** (Atlas, Local, etc.)

---

## 🚀 Instalação

### 1. Clone o repositório e instale dependências

```bash
cd nativespeak-api
npm install
````

### 2\. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais. **Atenção ao formato da URL do MongoDB:**

```env
# ATENÇÃO: Use o formato de URL de conexão do MongoDB
DATABASE_URL="mongodb://usuario:senha@host:port/nativespeak" 
JWT_SECRET="sua-chave-secreta-forte-aqui"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### 3\. Configure o banco de dados com Prisma

Como o MongoDB não usa o sistema de migrações (como o `prisma migrate dev`), usamos o `db push` para sincronizar o *schema* e criar as coleções:

```bash
# Gerar o Prisma Client
npm run prisma:generate

# Sincronizar o schema com o DB (cria as collections e índices)
npm run prisma:push 
```

### 4\. Inicie o servidor

```bash
# Desenvolvimento (hot reload)
npm run dev

# Produção
npm run build
npm start
```

O servidor estará rodando em `http://localhost:3001`

-----

## 📚 Documentação da API

Acesse `http://localhost:3001/api/docs` para ver a documentação completa dos *endpoints*.

-----

## 🔐 Autenticação

A API usa **JWT** (JSON Web Tokens) para autenticação.

### Fluxo de autenticação:

1.  **Registrar** - `POST /api/auth/register`
2.  **Login** - `POST /api/auth/login` → Retorna um `token`
3.  **Usar token** - Inclua em todas as requisições autenticadas:
       `     Authorization: Bearer <seu-token-aqui>     `

### Exemplo com cURL:

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "senha123"
  }'

# Usar token
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

-----

## 🛠️ Scripts disponíveis

```bash
npm run dev          # Desenvolvimento com hot reload
npm run build        # Build para produção
npm start            # Rodar build de produção
npm run prisma:generate  # Gerar Prisma Client
npm run prisma:push      # Push schema para DB (dev/prod)
npm run prisma:studio    # Abrir Prisma Studio (GUI)
```

-----

## 🗄️ Estrutura do Banco de Dados

```
User (Coleção 'users')
├── id (ObjectId/String)
├── email (unique)
├── password (hash)
├── firstName
├── lastName
├── credits
├── totalConversationTime
└── Relations (Referenciados por ID):
    ├── achievements[]
    ├── lessonProgress[]
    └── ... (outras coleções)
```

-----

## 🚢 Deploy

Todas as plataformas (Vercel, Railway, Render, Fly.io) suportam Node.js + Prisma. Configure:

  - `DATABASE_URL` nas variáveis de ambiente (URL de conexão MongoDB)
  - Build command: `npm run build && npm run prisma:generate`
  - Start command: `npm start`

-----

## 🐛 Troubleshooting

| Erro | Solução |
| :--- | :--- |
| `Error: P1001: Can't reach database server` | Verifique se a **`DATABASE_URL`** e a porta do MongoDB estão corretas e se o banco está acessível. |
| `Error: @prisma/client did not initialize yet` | Execute **`npm run prisma:generate`**. |
| `Error: jwt malformed` | Verifique se o token está sendo enviado no formato: **`Authorization: Bearer TOKEN`**. |

-----

## 📄 Licença

Apache 2.0 - Veja LICENSE.md

```
 