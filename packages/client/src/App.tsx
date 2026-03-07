// App：顶层组件，管理任务列表状态和筛选条件，协调各子组件

import { useState, useEffect, useCallback } from 'react';
import { fetchTasks, Task } from './api/tasks';
import TaskForm from './components/TaskForm';
import TaskFilter, { FilterValue } from './components/TaskFilter';
import TaskList from './components/TaskList';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterValue>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /** 根据当前筛选条件从后端拉取任务列表 */
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

  // 页面加载时和筛选条件变化时重新拉取
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return (
    <div className="page">
      <header className="header">
        <h1 className="header__title">TaskForge</h1>
        <p className="header__sub">简洁高效的任务管理</p>
      </header>

      <main className="container">
        <TaskForm onCreated={loadTasks} />

        <TaskFilter current={filter} onChange={setFilter} />

        {error && <p className="error-text">{error}</p>}

        <TaskList
          tasks={tasks}
          loading={loading}
          onUpdated={loadTasks}
          onDeleted={loadTasks}
        />
      </main>
    </div>
  );
}
