// 内存存储模块：用数组模拟数据库，提供任务的增删改查操作

import { v4 as uuidv4 } from 'uuid';
import { Task, CreateTaskBody, UpdateTaskBody } from '../types/task';

/** 预置示例任务的内存数组 */
export const tasks: Task[] = [
  {
    id: uuidv4(),
    title: '设计数据库 Schema',
    description: '为 TaskForge 设计 PostgreSQL 数据库表结构',
    status: 'done',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: '实现用户认证',
    description: '使用 JWT 实现登录注册接口',
    status: 'in-progress',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: '编写 API 文档',
    description: '',
    status: 'todo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/** 查询所有任务，可按 status 筛选 */
export function findAllTasks(status?: string): Task[] {
  if (status) {
    return tasks.filter((t) => t.status === status);
  }
  return tasks;
}

/** 按 id 查询单个任务，找不到返回 undefined */
export function findTaskById(id: string): Task | undefined {
  return tasks.find((t) => t.id === id);
}

/** 创建新任务，自动生成 id、状态和时间戳 */
export function createTask(body: CreateTaskBody): Task {
  const now = new Date().toISOString();
  const task: Task = {
    id: uuidv4(),
    title: body.title,
    description: body.description ?? '',
    status: 'todo',
    createdAt: now,
    updatedAt: now,
  };
  tasks.push(task);
  return task;
}

/** 更新任务字段，返回更新后的任务；找不到返回 undefined */
export function updateTask(id: string, body: UpdateTaskBody): Task | undefined {
  const task = findTaskById(id);
  if (!task) return undefined;

  if (body.title !== undefined) task.title = body.title;
  if (body.description !== undefined) task.description = body.description;
  if (body.status !== undefined) task.status = body.status;
  task.updatedAt = new Date().toISOString();

  return task;
}

/** 删除任务，返回是否删除成功 */
export function deleteTask(id: string): boolean {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}
