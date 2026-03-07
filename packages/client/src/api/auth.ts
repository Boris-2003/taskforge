// 认证 API：封装注册和登录请求，管理 localStorage 中的 token

import { bridge } from './bridge';

const API_BASE = 'http://localhost:3001/api';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

const TOKEN_KEY = 'taskforge_token';
const USER_KEY = 'taskforge_user';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
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

export async function register(
  email: string,
  username: string,
  password: string
): Promise<AuthUser> {
  const res = await apiFetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? '注册失败');
  return body as AuthUser;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await apiFetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? '登录失败');

  localStorage.setItem(TOKEN_KEY, body.token);
  localStorage.setItem(USER_KEY, JSON.stringify(body.user));
  return body.user as AuthUser;
}
