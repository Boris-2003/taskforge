// 认证路由：提供注册和登录接口

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET!;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/register
 * 注册新用户：验证格式 → 检查重复 → 加密密码 → 写库 → 返回用户信息
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    // 参数校验
    if (!email || !username || !password) {
      res.status(400).json({ error: 'email、username、password 均为必填' });
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({ error: 'email 格式不正确' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: '密码长度至少 6 位' });
      return;
    }

    // 检查 email 是否已被注册
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: '该邮箱已被注册' });
      return;
    }

    // bcrypt 加密密码（cost factor 10）
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword },
    });

    // 返回用户信息，绝对不返回 password 字段
    res.status(201).json({
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    });
  } catch {
    res.status(500).json({ error: '服务器错误，请稍后重试' });
  }
});

/**
 * POST /api/auth/login
 * 登录：查找用户 → 验证密码 → 签发 JWT → 返回 token 和用户信息
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'email 和 password 为必填' });
      return;
    }

    // 查找用户
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // 故意模糊错误，防止用户枚举攻击
      res.status(401).json({ error: '邮箱或密码错误' });
      return;
    }

    // 验证密码
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: '邮箱或密码错误' });
      return;
    }

    // 签发 JWT，有效期 7 天
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch {
    res.status(500).json({ error: '服务器错误，请稍后重试' });
  }
});

export default router;
