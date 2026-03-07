// App：顶层组件，管理认证状态和任务列表，根据登录状态渲染不同界面

import { useState, useEffect, useCallback } from 'react';
import { fetchTasks, Task } from './api/tasks';
import { getStoredUser, clearAuth, AuthUser } from './api/auth';
import AuthForm from './components/AuthForm';
import TaskForm from './components/TaskForm';
import TaskFilter, { FilterValue } from './components/TaskFilter';
import TaskList from './components/TaskList';

export default function App() {
  // 从 localStorage 读取初始用户状态，决定显示登录页还是主界面
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterValue>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchTasks(filter);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // 登录后或筛选条件变化时拉取数据
  useEffect(() => {
    if (user) loadTasks();
  }, [user, loadTasks]);

  /** 登录/注册成功回调 */
  function handleAuthSuccess(loggedInUser: AuthUser) {
    setUser(loggedInUser);
  }

  /** 退出登录：清除本地存储，回到登录页 */
  function handleLogout() {
    clearAuth();
    setUser(null);
    setTasks([]);
    setFilter(undefined);
  }

  // 未登录：显示认证表单
  if (!user) {
    return <AuthForm onSuccess={handleAuthSuccess} />;
  }

  // 已登录：显示任务管理界面
  return (
    <div className="page">
      <header className="header">
        <div className="header__inner">
          <div>
            <h1 className="header__title">TaskForge</h1>
            <p className="header__sub">简洁高效的任务管理</p>
          </div>
          <div className="header__user">
            <span className="header__username">{user.username}</span>
            <button className="btn btn--logout" onClick={handleLogout}>
              退出登录
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        <TaskForm onCreated={loadTasks} />
        <TaskFilter current={filter} onChange={setFilter} />
        {error && <p className="error-text">{error}</p>}
        <TaskList tasks={tasks} loading={loading} onUpdated={loadTasks} onDeleted={loadTasks} />
      </main>
    </div>
  );
}
