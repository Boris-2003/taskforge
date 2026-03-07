// 任务路由：定义 /api/tasks 相关的五个 CRUD 接口，所有接口均需认证

import { Router, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { requireAuth } from '../middleware/auth';
import { CreateTaskBody, UpdateTaskBody, TaskStatus } from '../types/task';

const router = Router();
const VALID_STATUSES: TaskStatus[] = ['todo', 'in-progress', 'done'];

// 所有任务接口都需要登录
router.use(requireAuth);

/**
 * GET /api/tasks
 * 返回当前用户的任务列表，支持 ?status=todo|in-progress|done 筛选
 */
router.get('/', async (req: Request, res: Response) => {
  const { status } = req.query;

  if (status && !VALID_STATUSES.includes(status as TaskStatus)) {
    res.status(400).json({ error: `status 必须是 ${VALID_STATUSES.join(', ')} 之一` });
    return;
  }

  const tasks = await prisma.task.findMany({
    where: {
      userId: req.user!.id,
      ...(status ? { status: status as string } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(tasks);
});

/**
 * GET /api/tasks/:id
 * 返回单个任务，仅限当前用户的任务，找不到返回 404
 */
router.get('/:id', async (req: Request, res: Response) => {
  const task = await prisma.task.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
  });
  if (!task) {
    res.status(404).json({ error: '任务不存在' });
    return;
  }
  res.json(task);
});

/**
 * POST /api/tasks
 * 创建任务，自动关联当前用户；需要 title 字段，description 可选
 */
router.post('/', async (req: Request<object, object, CreateTaskBody>, res: Response) => {
  const { title, description } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    res.status(400).json({ error: 'title 为必填字段且不能为空' });
    return;
  }

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      description: description ?? '',
      userId: req.user!.id, // 关联到当前登录用户
    },
  });
  res.status(201).json(task);
});

/**
 * PUT /api/tasks/:id
 * 更新任务，检查归属后才允许修改
 */
router.put('/:id', async (req: Request<{ id: string }, object, UpdateTaskBody>, res: Response) => {
  const { title, description, status } = req.body;

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    res.status(400).json({ error: `status 必须是 ${VALID_STATUSES.join(', ')} 之一` });
    return;
  }
  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    res.status(400).json({ error: 'title 不能为空字符串' });
    return;
  }

  // 同时检查 id 和 userId，防止越权操作
  const existing = await prisma.task.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
  });
  if (!existing) {
    res.status(404).json({ error: '任务不存在' });
    return;
  }

  const updated = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
    },
  });
  res.json(updated);
});

/**
 * DELETE /api/tasks/:id
 * 删除任务，检查归属后才允许删除
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const existing = await prisma.task.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
  });
  if (!existing) {
    res.status(404).json({ error: '任务不存在' });
    return;
  }

  await prisma.task.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
