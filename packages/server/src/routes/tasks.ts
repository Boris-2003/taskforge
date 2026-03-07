// 任务路由：五个 CRUD 接口，使用 Zod 校验输入，错误统一转交 errorHandler

import { Router, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { createTaskSchema, updateTaskSchema } from '../validators/task';

const router = Router();

// 所有任务接口都需要登录
router.use(requireAuth);

/**
 * GET /api/tasks
 * 返回当前用户的任务列表，支持 ?status= 筛选
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.query;

    // 简单校验 status 参数（非必填）
    if (status && !['todo', 'in-progress', 'done'].includes(status as string)) {
      res.status(400).json({ error: 'status 必须是 todo、in-progress、done 之一' });
      return;
    }

    const tasks = await prisma.task.findMany({
      where: { userId: req.user!.id, ...(status ? { status: status as string } : {}) },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  })
);

/**
 * GET /api/tasks/:id
 * 返回单个任务（仅限当前用户）
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!task) {
      res.status(404).json({ error: '任务不存在' });
      return;
    }
    res.json(task);
  })
);

/**
 * POST /api/tasks
 * 创建任务，Zod 校验 title/description，自动关联当前用户
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { title, description } = createTaskSchema.parse(req.body);

    const task = await prisma.task.create({
      data: { title, description: description ?? '', userId: req.user!.id },
    });
    res.status(201).json(task);
  })
);

/**
 * PUT /api/tasks/:id
 * 更新任务字段，Zod 校验，检查归属后修改
 */
router.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const data = updateTaskSchema.parse(req.body);

    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!existing) {
      res.status(404).json({ error: '任务不存在' });
      return;
    }

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data,
    });
    res.json(updated);
  })
);

/**
 * DELETE /api/tasks/:id
 * 删除任务，检查归属后删除
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!existing) {
      res.status(404).json({ error: '任务不存在' });
      return;
    }
    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

export default router;
