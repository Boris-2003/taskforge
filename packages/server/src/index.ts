// 后端入口：初始化 Express 应用，注册中间件和路由

import express from 'express';
import cors from 'cors';
import tasksRouter from './routes/tasks';

const app = express();
const PORT = process.env.PORT || 3001;

// 允许前端开发服务器跨域访问
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 任务 CRUD 路由
app.use('/api/tasks', tasksRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
