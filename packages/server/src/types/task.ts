// 定义任务相关的 TypeScript 类型

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

/** POST /api/tasks 请求体 */
export interface CreateTaskBody {
  title: string;
  description?: string;
}

/** PUT /api/tasks/:id 请求体，所有字段均为可选 */
export interface UpdateTaskBody {
  title?: string;
  description?: string;
  status?: TaskStatus;
}
