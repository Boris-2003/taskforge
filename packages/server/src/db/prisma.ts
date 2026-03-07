// Prisma 客户端单例：避免 ts-node-dev 热重载时重复创建数据库连接

import { PrismaClient } from '@prisma/client';

// 在 globalThis 上挂载实例，热重载时复用已有连接
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
