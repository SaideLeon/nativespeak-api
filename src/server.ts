// src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import progressRoutes from './routes/progress.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes); 

// Health check
app.get('/health', (_req: express.Request, res: express.Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // API Documentation endpoint
  app.get('/api/docs', (_req: express.Request, res: express.Response) => {
    res.json({
      name: 'NativeSpeak API',
      version: '1.0.0',
      description: 'API REST para o aplicativo NativeSpeak',
      endpoints: {
        auth: {
          'POST /api/auth/register': {
            description: 'Registrar novo usuário',
            body: {
              email: 'string (required)',
              password: 'string (min 6 chars, required)',
              firstName: 'string (required)',
              lastName: 'string (required)',
            },
            response: {
              user: 'User object',
              token: 'JWT token',
            },
          },
          'POST /api/auth/login': {
            description: 'Login de usuário',
            body: {
              email: 'string (required)',
              password: 'string (required)',
            },
            response: {
              user: 'User object',
              token: 'JWT token',
            },
          },
          'GET /api/auth/me': {
            description: 'Obter dados do usuário autenticado',
            headers: {
              Authorization: 'Bearer <token>',
            },
            response: 'User object',
          },
          'POST /api/auth/accept-terms': {
            description: 'Aceitar termos de uso',
            headers: {
              Authorization: 'Bearer <token>',
            },
          },
        },
        users: {
          'PATCH /api/users/profile': {
            description: 'Atualizar perfil',
            headers: {
              Authorization: 'Bearer <token>',
            },
            body: {
              avatar: 'string (optional)',
              theme: 'string (optional)',
            },
          },
          'PATCH /api/users/credits': {
            description: 'Atualizar créditos',
            headers: {
              Authorization: 'Bearer <token>',
            },
            body: {
              amount: 'number (required)',
            },
          },
          'POST /api/users/conversation-time': {
            description: 'Adicionar tempo de conversação',
            headers: {
              Authorization: 'Bearer <token>',
            },
            body: {
              seconds: 'number (required)',
            },
          },
          'POST /api/users/completed-lessons': {
            description: 'Incrementar aulas concluídas',
            headers: {
              Authorization: 'Bearer <token>',
            },
          },
        },
        progress: {
          'GET /api/progress/lessons': {
            description: 'Obter progresso de todas as aulas',
            headers: {
              Authorization: 'Bearer <token>',
            },
          },
          'PUT /api/progress/lessons/:topic': {
            description: 'Atualizar progresso de uma aula',
            headers: {
              Authorization: 'Bearer <token>',
            },
            body: {
              currentStep: 'number (1-5, required)',
            },
          },
          'GET /api/progress/achievements': {
            description: 'Obter conquistas',
            headers: {
              Authorization: 'Bearer <token>',
            },
          },
          'POST /api/progress/achievements': {
            description: 'Desbloquear conquista',
            headers: {
              Authorization: 'Bearer <token>',
            },
            body: {
              achievementId: 'string (required)',
            },
          },
          'GET /api/progress/todos': {
            description: 'Obter todos',
            headers: {
              Authorization: 'Bearer <token>',
            },
          },
          'POST /api/progress/todos': {
            description: 'Criar todo',
            headers: {
              Authorization: 'Bearer <token>',
            },
            body: {
              text: 'string (required)',
              isHeader: 'boolean (optional)',
              duration: 'number (optional)',
            },
          },
          'PATCH /api/progress/todos/:id': {
            description: 'Atualizar status de todo',
            headers: {
              Authorization: 'Bearer <token>',
            },
            body: {
              status: 'enum: todo | inProgress | completed',
            },
          },
          'DELETE /api/progress/todos/:id': {
            description: 'Deletar todo',
            headers: {
              Authorization: 'Bearer <token>',
            },
          },
        },
      },
      examples: {
        register: {
          method: 'POST',
          url: '/api/auth/register',
          body: {
            email: 'usuario@exemplo.com',
            password: 'senha123',
            firstName: 'João',
            lastName: 'Silva',
          },
        },
        login: {
          method: 'POST',
          url: '/api/auth/login',
          body: {
            email: 'usuario@exemplo.com',
            password: 'senha123',
          },
        },
      },
    });
  });
  
  // 404 handler
  app.use((_req: express.Request, res: express.Response) => {
    res.status(404).json({ error: 'Rota não encontrada' });
  });
  
  // Error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Erro interno do servidor',
    });
  });
  
  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📚 Documentação: http://localhost:${PORT}/api/docs`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
  });
  
  export default app;