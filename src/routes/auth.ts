// src/routes/auth.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { z } from 'zod';
import { generateToken, authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

/**
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = registerSchema.parse(req.body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Já existe um usuário com este e-mail.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        termsAccepted: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        studyStartDate: true,
        credits: true,
        totalConversationTime: true,
        completedLessons: true,
        avatar: true,
        theme: true,
        termsAccepted: true,
      },
    });

    // Generate JWT
    const token = generateToken(user.id, user.email);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      user,
      token,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Dados inválidos', details: error.errors });
    }
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(400).json({ success: false, message: 'Já existe um usuário com este e-mail.' });
    }
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao criar usuário' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuário
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'E-mail ou senha inválidos.' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'E-mail ou senha inválidos.' });
    }

    // Generate JWT
    const token = generateToken(user.id, user.email);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Dados inválidos', details: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao fazer login' });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Obter usuário atual
 * @access  Private
 */
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        studyStartDate: true,
        credits: true,
        totalConversationTime: true,
        completedLessons: true,
        avatar: true,
        theme: true,
        termsAccepted: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao buscar usuário' });
  }
});

/**
 * @route   POST /api/auth/accept-terms
 * @desc    Aceitar termos de uso
 * @access  Private
 */
router.post('/accept-terms', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { termsAccepted: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        termsAccepted: true,
      },
    });

    res.json({
      success: true,
      message: 'Termos aceitos com sucesso',
      user,
    });
  } catch (error) {
    console.error('Accept terms error:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao aceitar termos' });
  }
});

export default router;
