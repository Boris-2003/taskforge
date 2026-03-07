// 认证路由：提供注册和登录接口，使用 Zod 做输入校验

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { registerSchema, loginSchema } from '../validators/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * POST /api/auth/register
 * 注册新用户：Zod 校验 → 检查重复 → 加密密码 → 写库 → 返回用户信息
 */
router.post(
  '/register',
  asyncHandler(async (req: Request, res: Response) => {
    // Zod 解析：失败时抛出 ZodError，由 errorHandler 处理
    const { email, username, password } = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: '该邮箱已被注册' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword },
    });

    // 返回用户信息，绝对不包含 password 字段
    res.status(201).json({
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    });
  })
);

/**
 * POST /api/auth/login
 * 登录：Zod 校验 → 查找用户 → 验证密码 → 签发 JWT
 */
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: '邮箱或密码错误' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: '邮箱或密码错误' });
      return;
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username },
    });
  })
);

export default router;
