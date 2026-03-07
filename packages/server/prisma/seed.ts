// 数据库种子：向 Task 表插入示例数据，用于开发和演示

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 先清空已有数据，保证 seed 幂等（重复执行不会重复插入）
  await prisma.task.deleteMany();

  await prisma.task.createMany({
    data: [
      {
        title: '设计数据库 Schema',
        description: '为 TaskForge 设计 PostgreSQL 数据库表结构',
        status: 'done',
      },
      {
        title: '实现用户认证',
        description: '使用 JWT 实现登录注册接口',
        status: 'in-progress',
      },
      {
        title: '编写 API 文档',
        description: '',
        status: 'todo',
      },
    ],
  });

  console.log('✓ 种子数据插入成功');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
