// 任务接口输入校验：使用 Zod v4 定义创建和更新任务的参数结构

import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, '标题不能为空')
    .max(100, '标题最多 100 个字符'),
  description: z
    .string()
    .max(500, '描述最多 500 个字符')
    .optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, '标题不能为空')
    .max(100, '标题最多 100 个字符')
    .optional(),
  description: z
    .string()
    .max(500, '描述最多 500 个字符')
    .optional(),
  // Zod v4：enum 使用 as const 元组，自定义错误用 error 字段
  status: z
    .enum(['todo', 'in-progress', 'done'] as const, {
      error: 'status 必须是 todo、in-progress、done 之一',
    })
    .optional(),
});
