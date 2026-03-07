// 认证中间件：验证请求头中的 JWT Bearer Token，有效则将用户信息挂到 req.user

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
}

const JWT_SECRET = process.env.JWT_SECRET!;

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  // 检查请求头格式：必须是 "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: '未登录，请先登录' });
    return;
  }

  const token = authHeader.slice(7); // 去掉 "Bearer " 前缀

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    // 将解码后的用户信息挂到请求对象上，供后续路由使用
    req.user = { id: payload.userId, email: payload.email };
    next();
  } catch {
    res.status(401).json({ error: 'Token 无效或已过期，请重新登录' });
  }
}
