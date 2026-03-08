// API 请求封装：自动携带 JWT，统一处理网络错误/Token 过期/服务器错误

import { getToken } from './auth';
import { bridge } from './bridge';

const API_BASE = '/api';

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** 统一响应处理：处理特殊错误状态并抛出 */
async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;

  if (res.ok) return res.json();

  const body = await res.json().catch(() => ({}));
  const message: string = body.error ?? `请求失败：${res.status}`;

  // Token 过期或失效 → 触发登出
  if (res.status === 401 && message.includes('Token')) {
    bridge.toast('error', '登录已过期，请重新登录');
    bridge.authExpired();
    throw new Error(message);
  }

  // 服务器错误
  if (res.status >= 500) {
    bridge.toast('error', '服务器繁忙，请稍后再试');
    throw new Error(message);
  }

  throw new Error(message);
}

/** fetch 包装：捕获网络断开异常 */
async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    bridge.toast('error', '网络连接失败，请检查网络');
    throw new Error('网络连接失败');
  }
}

export async function fetchTasks(status?: TaskStatus): Promise<Task[]> {
  const url = status ? `${API_BASE}/tasks?status=${encodeURIComponent(status)}` : `${API_BASE}/tasks`;
  const res = await apiFetch(url, { headers: authHeaders() });
  return handleResponse<Task[]>(res);
}

export async function createTask(title: string, description: string): Promise<Task> {
  const res = await apiFetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ title, description }),
  });
  return handleResponse<Task>(res);
}

export async function updateTask(
  id: string,
  data: { title?: string; description?: string; status?: TaskStatus }
): Promise<Task> {
  const res = await apiFetch(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Task>(res);
}

export async function deleteTask(id: string): Promise<void> {
  const res = await apiFetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse<void>(res);
}
