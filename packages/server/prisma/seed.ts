// 数据库种子：创建测试用户和示例任务

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 清空旧数据（保证幂等，顺序：先删任务再删用户）
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  // 创建测试用户
  const hashedPassword = await bcrypt.hash('123456', 10);
  const user = await prisma.user.create({
    data: {
      email: 'test@taskforge.com',
      username: 'TestUser',
      password: hashedPassword,
    },
  });

  // 创建与该用户关联的示例任务
  await prisma.task.createMany({
    data: [
      {
        title: '设计数据库 Schema',
        description: '为 TaskForge 设计 PostgreSQL 数据库表结构',
        status: 'done',
        userId: user.id,
      },
      {
        title: '实现用户认证',
        description: '使用 JWT 实现登录注册接口',
        status: 'in-progress',
        userId: user.id,
      },
      {
        title: '编写 API 文档',
        description: '',
        status: 'todo',
        userId: user.id,
      },
    ],
  });

  console.log('✓ 测试用户：test@taskforge.com / 123456');
  console.log('✓ 示例任务插入成功');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
