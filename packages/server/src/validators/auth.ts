// 认证接口输入校验：使用 Zod 定义注册和登录的参数结构

import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  username: z
    .string()
    .min(2, '用户名至少 2 个字符')
    .max(30, '用户名最多 30 个字符'),
  password: z
    .string()
    .min(6, '密码至少 6 位')
    .max(50, '密码最多 50 位'),
});

export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
});
