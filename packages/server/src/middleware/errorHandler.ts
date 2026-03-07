// 全局错误处理中间件：统一处理 Zod 校验错误、Prisma 数据库错误和未知错误

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const isDev = process.env.NODE_ENV !== 'production';

  // Zod v4 校验失败：issues 数组包含所有校验错误
  if (err instanceof ZodError) {
    const messages = err.issues.map((i) => i.message);
    res.status(400).json({ error: messages[0], details: messages });
    return;
  }

  // Prisma 已知错误
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: '该数据已存在，请检查后重新提交' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: '数据不存在' });
      return;
    }
  }

  // 其他未知错误
  console.error('[Server Error]', err);
  res.status(500).json({
    error: '服务器内部错误，请稍后再试',
    ...(isDev && err instanceof Error ? { detail: err.message } : {}),
  });
}
