# TaskForge

简洁高效的全栈任务管理系统，支持用户认证、任务 CRUD 和 PWA 离线访问。

**在线演示：** http://8.147.57.78:8080

---

## 功能特性

- 用户注册 / 登录（JWT 认证，7 天有效期）
- 任务增删改查（标题、描述、状态）
- 状态筛选（全部 / 待办 / 进行中 / 已完成）
- 任务与用户隔离，数据安全
- 响应式设计，移动端友好
- PWA 支持，可安装到桌面 / 主屏幕

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite |
| 后端 | Node.js + Express + TypeScript |
| 数据库 | PostgreSQL + Prisma ORM |
| 部署 | Nginx + PM2 |

---

## 项目结构

```
taskforge/
├── packages/
│   ├── client/          # 前端（React + Vite）
│   │   ├── src/
│   │   │   ├── api/     # fetch 请求封装
│   │   │   ├── components/
│   │   │   ├── context/ # Toast 全局状态
│   │   │   └── styles/
│   │   └── public/      # PWA 资源（manifest、sw.js、图标）
│   └── server/          # 后端（Express）
│       ├── src/
│       │   ├── routes/
│       │   ├── middleware/
│       │   ├── validators/
│       │   └── db/
│       └── prisma/      # Schema 和迁移文件
├── pnpm-workspace.yaml
└── docker-compose.yml   # 本地 PostgreSQL（可选）
```

---

## 本地开发

**前置要求：** Node.js 18+、pnpm、PostgreSQL（或 Neon 云数据库）

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example packages/server/.env
# 编辑 packages/server/.env，填写数据库连接串和 JWT 密钥

# 3. 同步数据库
cd packages/server
pnpm exec prisma migrate dev
pnpm exec prisma db seed   # 写入测试数据

# 4. 启动开发服务器（前后端并行）
cd ../..
pnpm dev
```

- 前端：http://localhost:5173
- 后端：http://localhost:3001

---

## 环境变量

在 `packages/server/.env` 中配置：

| 变量 | 说明 | 示例 |
|------|------|------|
| `DATABASE_URL` | PostgreSQL 连接串 | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | JWT 签名密钥（生产环境请使用随机长字符串） | `your-secret-key` |
| `PORT` | 服务端口（默认 3001） | `3001` |

测试账号（seed 数据）：`test@taskforge.com` / `123456`
