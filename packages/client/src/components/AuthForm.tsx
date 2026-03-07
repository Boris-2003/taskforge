// AuthForm：登录/注册切换表单组件

import { useState } from 'react';
import { login, register, AuthUser } from '../api/auth';

interface AuthFormProps {
  onSuccess: (user: AuthUser) => void; // 认证成功后通知父组件
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const user = await login(email, password);
        onSuccess(user);
      } else {
        // 注册成功后自动登录
        await register(email, username, password);
        const user = await login(email, password);
        onSuccess(user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  }

  const isLogin = mode === 'login';

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1 className="auth-title">TaskForge</h1>
        <p className="auth-sub">{isLogin ? '登录你的账户' : '创建新账户'}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            className="input"
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />

          {/* 注册模式才显示用户名 */}
          {!isLogin && (
            <input
              className="input"
              type="text"
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          )}

          <input
            className="input"
            type="password"
            placeholder={isLogin ? '密码' : '密码（至少 6 位）'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />

          {error && <p className="error-text">{error}</p>}

          <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
            {loading ? '处理中…' : isLogin ? '登录' : '注册'}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? '还没有账号？' : '已有账号？'}
          <button className="btn-link" onClick={switchMode} disabled={loading}>
            {isLogin ? '立即注册' : '去登录'}
          </button>
        </p>
      </div>
    </div>
  );
}
