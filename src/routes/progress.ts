// src/routes/progress.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

/**
 * @route   GET /api/progress/lessons
 * @desc    Obter progresso de todas as aulas
 * @access  Private
 */
router.get('/lessons', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const progress = await prisma.lessonProgress.findMany({
      where: { userId: req.userId },
      select: {
        lessonTopic: true,
        currentStep: true,
        updatedAt: true,
      },
    });

    const progressMap = progress.reduce((acc, item) => {
      acc[item.lessonTopic] = {
        currentStep: item.currentStep,
        updatedAt: item.updatedAt,
      };
      return acc;
    }, {} as Record<string, { currentStep: number; updatedAt: Date }>);

    res.json(progressMap);
  } catch (error) {
    console.error('Get lessons progress error:', error);
    res.status(500).json({ error: 'Erro ao buscar progresso das aulas' });
  }
});

/**
 * @route   PUT /api/progress/lessons/:topic
 * @desc    Atualizar progresso de uma aula
 * @access  Private
 */
router.put('/lessons/:topic', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { topic } = req.params;
    const { currentStep } = z.object({
      currentStep: z.number().min(1).max(5),
    }).parse(req.body);

    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonTopic: {
          userId: req.userId!,
          lessonTopic: topic,
        },
      },
      update: { currentStep },
      create: {
        userId: req.userId!,
        lessonTopic: topic,
        currentStep,
      },
    });

    res.json({
      message: 'Progresso atualizado',
      progress,
    });
  } catch (error) {
    console.error('Update lesson progress error:', error);
    res.status(500).json({ error: 'Erro ao atualizar progresso da aula' });
  }
});

/**
 * @route   GET /api/progress/achievements
 * @desc    Obter todas as conquistas do usuário
 * @access  Private
 */
router.get('/achievements', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const achievements = await prisma.achievement.findMany({
      where: { userId: req.userId },
      select: {
        achievementId: true,
        unlockedAt: true,
      },
      orderBy: { unlockedAt: 'desc' },
    });

    res.json(achievements);
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Erro ao buscar conquistas' });
  }
});

/**
 * @route   POST /api/progress/achievements
 * @desc    Desbloquear uma conquista
 * @access  Private
 */
router.post('/achievements', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { achievementId } = z.object({
      achievementId: z.string(),
    }).parse(req.body);

    // Check if already unlocked
    const existing = await prisma.achievement.findUnique({
      where: {
        userId_achievementId: {
          userId: req.userId!,
          achievementId,
        },
      },
    });

    if (existing) {
      return res.status(200).json({
        message: 'Conquista já desbloqueada',
        achievement: existing,
      });
    }

    const achievement = await prisma.achievement.create({
      data: {
        userId: req.userId!,
        achievementId,
      },
    });

    res.status(201).json({
      message: 'Conquista desbloqueada',
      achievement,
    });
  } catch (error) {
    console.error('Unlock achievement error:', error);
    res.status(500).json({ error: 'Erro ao desbloquear conquista' });
  }
});

/**
 * @route   GET /api/progress/todos
 * @desc    Obter todos os todos do usuário
 * @access  Private
 */
router.get('/todos', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const todos = await prisma.todo.findMany({
      where: { userId: req.userId },
      orderBy: { order: 'asc' },
    });

    res.json(todos);
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ error: 'Erro ao buscar todos' });
  }
});

/**
 * @route   POST /api/progress/todos
 * @desc    Criar novo todo
 * @access  Private
 */
router.post('/todos', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const schema = z.object({
      text: z.string(),
      isHeader: z.boolean().optional(),
      duration: z.number().optional(),
    });

    const data = schema.parse(req.body);

    // Get max order
    const maxOrder = await prisma.todo.aggregate({
      where: { userId: req.userId },
      _max: { order: true },
    });

    const todo = await prisma.todo.create({
      data: {
        userId: req.userId!,
        text: data.text,
        isHeader: data.isHeader || false,
        duration: data.duration || 0,
        order: (maxOrder._max.order || 0) + 1,
      },
    });

    res.status(201).json({
      message: 'Todo criado',
      todo,
    });
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Erro ao criar todo' });
  }
});

/**
 * @route   PATCH /api/progress/todos/:id
 * @desc    Atualizar status de um todo
 * @access  Private
 */
router.patch('/todos/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = z.object({
      status: z.enum(['todo', 'inProgress', 'completed']),
    }).parse(req.body);

    const todo = await prisma.todo.updateMany({
      where: {
        id,
        userId: req.userId,
      },
      data: { status },
    });

    if (todo.count === 0) {
      return res.status(404).json({ error: 'Todo não encontrado' });
    }

    res.json({
      message: 'Todo atualizado',
    });
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Erro ao atualizar todo' });
  }
});

/**
 * @route   DELETE /api/progress/todos/:id
 * @desc    Deletar um todo
 * @access  Private
 */
router.delete('/todos/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const result = await prisma.todo.deleteMany({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Todo não encontrado' });
    }

    res.json({
      message: 'Todo deletado',
    });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Erro ao deletar todo' });
  }
});

export default router;