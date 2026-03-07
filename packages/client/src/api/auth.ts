// 认证 API：封装注册和登录请求，管理 localStorage 中的 token

const API_BASE = 'http://localhost:3001/api';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

const TOKEN_KEY = 'taskforge_token';
const USER_KEY = 'taskforge_user';

/** 从 localStorage 读取 token */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** 从 localStorage 读取当前用户信息 */
export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/** 清除登录状态 */
export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/** 注册新用户 */
export async function register(
  email: string,
  username: string,
  password: string
): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? '注册失败');
  return body as AuthUser;
}

/** 登录，成功后将 token 和用户信息存入 localStorage */
export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? '登录失败');

  // 持久化 token 和用户信息
  localStorage.setItem(TOKEN_KEY, body.token);
  localStorage.setItem(USER_KEY, JSON.stringify(body.user));

  return body.user as AuthUser;
}
