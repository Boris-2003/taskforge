// API 请求封装：统一管理对后端 /api/tasks 接口的所有请求

const API_BASE = 'http://localhost:3001/api';

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

/** 统一处理响应，非 2xx 时抛出错误 */
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `请求失败：${res.status}`);
  }
  // 204 No Content 没有响应体
  if (res.status === 204) return undefined as T;
  return res.json();
}

/** 获取任务列表，可按 status 筛选 */
export async function fetchTasks(status?: TaskStatus): Promise<Task[]> {
  const url = new URL(`${API_BASE}/tasks`);
  if (status) url.searchParams.set('status', status);
  const res = await fetch(url.toString());
  return handleResponse<Task[]>(res);
}

/** 创建新任务 */
export async function createTask(title: string, description: string): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description }),
  });
  return handleResponse<Task>(res);
}

/** 更新任务的字段（title / description / status 均可选） */
export async function updateTask(
  id: string,
  data: { title?: string; description?: string; status?: TaskStatus }
): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Task>(res);
}

/** 删除任务 */
export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
  return handleResponse<void>(res);
}
