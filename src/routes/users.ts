// src/routes/users.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

/**
 * @route   PATCH /api/users/profile
 * @desc    Atualizar perfil do usuário
 * @access  Private
 */
router.patch('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const updateSchema = z.object({
      avatar: z.string().optional(),
      theme: z.string().optional(),
    });

    const data = updateSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        theme: true,
      },
    });

    res.json({
      message: 'Perfil atualizado com sucesso',
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

/**
 * @route   PATCH /api/users/credits
 * @desc    Atualizar créditos do usuário
 * @access  Private
 */
router.patch('/credits', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { amount } = z.object({
      amount: z.number(),
    }).parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { credits: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const newCredits = Math.max(0, user.credits + amount);

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: { credits: newCredits },
      select: { credits: true },
    });

    res.json({
      message: 'Créditos atualizados',
      credits: updatedUser.credits,
    });
  } catch (error) {
    console.error('Update credits error:', error);
    res.status(500).json({ error: 'Erro ao atualizar créditos' });
  }
});

/**
 * @route   POST /api/users/conversation-time
 * @desc    Adicionar tempo de conversação
 * @access  Private
 */
router.post('/conversation-time', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { seconds } = z.object({
      seconds: z.number().positive(),
    }).parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        totalConversationTime: {
          increment: seconds,
        },
      },
      select: {
        totalConversationTime: true,
      },
    });

    res.json({
      message: 'Tempo de conversação atualizado',
      totalConversationTime: user.totalConversationTime,
    });
  } catch (error) {
    console.error('Add conversation time error:', error);
    res.status(500).json({ error: 'Erro ao adicionar tempo de conversação' });
  }
});

/**
 * @route   POST /api/users/completed-lessons
 * @desc    Incrementar aulas concluídas
 * @access  Private
 */
router.post('/completed-lessons', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        completedLessons: {
          increment: 1,
        },
      },
      select: {
        completedLessons: true,
      },
    });

    res.json({
      message: 'Aula concluída registrada',
      completedLessons: user.completedLessons,
    });
  } catch (error) {
    console.error('Increment lessons error:', error);
    res.status(500).json({ error: 'Erro ao registrar aula concluída' });
  }
});

export default router;