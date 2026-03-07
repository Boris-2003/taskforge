// TaskList：渲染任务卡片列表，无任务时显示空状态提示

import { Task } from '../api/tasks';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onUpdated: () => void;
  onDeleted: () => void;
}

export default function TaskList({ tasks, loading, onUpdated, onDeleted }: TaskListProps) {
  if (loading) {
    return <p className="empty-hint">加载中…</p>;
  }

  if (tasks.length === 0) {
    return <p className="empty-hint">暂无任务</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskItem task={task} onUpdated={onUpdated} onDeleted={onDeleted} />
        </li>
      ))}
    </ul>
  );
}
