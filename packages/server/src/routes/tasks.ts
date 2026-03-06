// 任务路由：定义 /api/tasks 相关的五个 CRUD 接口

import { Router, Request, Response } from 'express';
import { findAllTasks, findTaskById, createTask, updateTask, deleteTask } from '../store/tasks';
import { CreateTaskBody, UpdateTaskBody, TaskStatus } from '../types/task';

const router = Router();

const VALID_STATUSES: TaskStatus[] = ['todo', 'in-progress', 'done'];

/**
 * GET /api/tasks
 * 返回所有任务列表，支持 ?status=todo|in-progress|done 筛选
 */
router.get('/', (req: Request, res: Response) => {
  const { status } = req.query;

  if (status && !VALID_STATUSES.includes(status as TaskStatus)) {
    res.status(400).json({ error: `status 必须是 ${VALID_STATUSES.join(', ')} 之一` });
    return;
  }

  const result = findAllTasks(status as string | undefined);
  res.json(result);
});

/**
 * GET /api/tasks/:id
 * 返回单个任务，找不到返回 404
 */
router.get('/:id', (req: Request, res: Response) => {
  const task = findTaskById(req.params.id);
  if (!task) {
    res.status(404).json({ error: '任务不存在' });
    return;
  }
  res.json(task);
});

/**
 * POST /api/tasks
 * 创建任务，需要 title 字段；description 可选
 */
router.post('/', (req: Request<object, object, CreateTaskBody>, res: Response) => {
  const { title, description } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    res.status(400).json({ error: 'title 为必填字段且不能为空' });
    return;
  }

  const task = createTask({ title: title.trim(), description });
  res.status(201).json(task);
});

/**
 * PUT /api/tasks/:id
 * 更新任务的 title、description 或 status，找不到返回 404
 */
router.put('/:id', (req: Request<{ id: string }, object, UpdateTaskBody>, res: Response) => {
  const { title, description, status } = req.body;

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    res.status(400).json({ error: `status 必须是 ${VALID_STATUSES.join(', ')} 之一` });
    return;
  }

  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    res.status(400).json({ error: 'title 不能为空字符串' });
    return;
  }

  const updated = updateTask(req.params.id, {
    title: title?.trim(),
    description,
    status,
  });

  if (!updated) {
    res.status(404).json({ error: '任务不存在' });
    return;
  }

  res.json(updated);
});

/**
 * DELETE /api/tasks/:id
 * 删除任务，找不到返回 404，成功返回 204
 */
router.delete('/:id', (req: Request, res: Response) => {
  const deleted = deleteTask(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: '任务不存在' });
    return;
  }
  res.status(204).send();
});

export default router;
