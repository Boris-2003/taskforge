// AuthForm：登录/注册切换表单，含前端校验和图标输入框

import { useState } from 'react';
import { login, register, AuthUser } from '../api/auth';

interface AuthFormProps {
  onSuccess: (user: AuthUser) => void;
}

interface FieldErrors {
  email?: string;
  username?: string;
  password?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const isLogin = mode === 'login';

  /** 前端校验，返回是否通过 */
  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!EMAIL_RE.test(email)) errors.email = '请输入有效的邮箱地址';
    if (!isLogin && (username.length < 2 || username.length > 30))
      errors.username = '用户名 2-30 个字符';
    if (password.length < 6) errors.password = '密码至少 6 位';
    if (password.length > 50) errors.password = '密码最多 50 位';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError('');
    if (!validate()) return;

    setLoading(true);
    try {
      if (isLogin) {
        const user = await login(email, password);
        onSuccess(user);
      } else {
        await register(email, username, password);
        const user = await login(email, password);
        onSuccess(user);
      }
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(isLogin ? 'register' : 'login');
    setFieldErrors({});
    setGlobalError('');
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-logo__icon">⚡</span>
          <span className="auth-logo__text">TaskForge</span>
        </div>
        <p className="auth-tagline">简洁高效，掌控每一项任务</p>

        {/* Tab 切换 */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'auth-tab--active' : ''}`}
            onClick={() => { setMode('login'); setFieldErrors({}); setGlobalError(''); }}
            type="button"
          >
            登录
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'auth-tab--active' : ''}`}
            onClick={() => { setMode('register'); setFieldErrors({}); setGlobalError(''); }}
            type="button"
          >
            注册
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* 邮箱 */}
          <div className="field">
            <div className={`input-group ${fieldErrors.email ? 'input-group--error' : ''}`}>
              <span className="input-group__icon">✉</span>
              <input
                className="input input--bare"
                type="email"
                placeholder="邮箱地址"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
                disabled={loading}
                autoComplete="email"
              />
            </div>
            {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
          </div>

          {/* 用户名（注册模式） */}
          {!isLogin && (
            <div className="field">
              <div className={`input-group ${fieldErrors.username ? 'input-group--error' : ''}`}>
                <span className="input-group__icon">👤</span>
                <input
                  className="input input--bare"
                  type="text"
                  placeholder="用户名（2-30 字符）"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setFieldErrors((p) => ({ ...p, username: undefined })); }}
                  disabled={loading}
                />
              </div>
              {fieldErrors.username && <p className="field-error">{fieldErrors.username}</p>}
            </div>
          )}

          {/* 密码 */}
          <div className="field">
            <div className={`input-group ${fieldErrors.password ? 'input-group--error' : ''}`}>
              <span className="input-group__icon">🔒</span>
              <input
                className="input input--bare"
                type="password"
                placeholder={isLogin ? '密码' : '密码（至少 6 位）'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
                disabled={loading}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </div>
            {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
          </div>

          {globalError && <p className="global-error">{globalError}</p>}

          <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" />
                处理中…
              </span>
            ) : isLogin ? '登录' : '创建账号'}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? '还没有账号？' : '已有账号？'}
          <button className="btn-link" onClick={switchMode} type="button" disabled={loading}>
            {isLogin ? '立即注册' : '去登录'}
          </button>
        </p>
      </div>
    </div>
  );
}
