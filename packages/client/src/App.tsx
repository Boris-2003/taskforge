// App：顶层组件，管理认证状态和任务列表

import { useState, useEffect, useCallback } from 'react';
import { fetchTasks, Task } from './api/tasks';
import { getStoredUser, clearAuth, AuthUser } from './api/auth';
import { bridge } from './api/bridge';
import { useToast } from './context/ToastContext';
import AuthForm from './components/AuthForm';
import TaskForm from './components/TaskForm';
import TaskFilter, { FilterValue } from './components/TaskFilter';
import TaskList from './components/TaskList';
import Toast from './components/Toast';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterValue>(undefined);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // 注册 token 过期回调到 bridge
  useEffect(() => {
    bridge.registerAuthExpired(() => {
      clearAuth();
      setUser(null);
      setTasks([]);
    });
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTasks(filter);
      setTasks(data);
    } catch {
      // 错误已由 api 层通过 bridge.toast 展示，此处不重复处理
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (user) loadTasks();
  }, [user, loadTasks]);

  function handleLogout() {
    clearAuth();
    setUser(null);
    setTasks([]);
    setFilter(undefined);
    showToast('success', '已退出登录');
  }

  // 统计各状态数量
  const counts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  if (!user) {
    return (
      <>
        <AuthForm onSuccess={setUser} />
        <Toast />
      </>
    );
  }

  return (
    <div className="page">
      {/* 顶部导航栏 */}
      <nav className="navbar">
        <div className="navbar__inner">
          <div className="navbar__brand">
            <span className="navbar__logo-icon">⚡</span>
            <span className="navbar__logo-text">TaskForge</span>
          </div>
          <div className="navbar__user">
            <span className="navbar__username">👤 {user.username}</span>
            <button className="btn btn--outline-white" onClick={handleLogout}>
              退出登录
            </button>
          </div>
        </div>
      </nav>

      <main className="page-content">
        <TaskForm onCreated={loadTasks} />
        <TaskFilter current={filter} onChange={setFilter} counts={counts} />
        <TaskList tasks={tasks} loading={loading} onUpdated={loadTasks} onDeleted={loadTasks} />

        {/* 底部统计栏 */}
        {!loading && (
          <div className="stats-bar">
            <span>共 <strong>{counts.all}</strong> 项任务</span>
            <span className="stats-bar__dot stats-bar__dot--todo" />
            <span>待办 {counts.todo}</span>
            <span className="stats-bar__dot stats-bar__dot--progress" />
            <span>进行中 {counts['in-progress']}</span>
            <span className="stats-bar__dot stats-bar__dot--done" />
            <span>已完成 {counts.done}</span>
          </div>
        )}
      </main>

      <Toast />
    </div>
  );
}
