// TaskList：渲染任务列表，带淡入动画；空状态显示 CSS 插画提示

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
    return (
      <div className="empty-state">
        <div className="empty-state__spinner" />
        <p className="empty-state__text">加载中…</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        {/* CSS 插画：简单的任务清单图标 */}
        <div className="empty-state__icon">
          <div className="empty-icon">
            <div className="empty-icon__paper" />
            <div className="empty-icon__line" />
            <div className="empty-icon__line" />
            <div className="empty-icon__line empty-icon__line--short" />
          </div>
        </div>
        <p className="empty-state__text">暂无任务</p>
        <p className="empty-state__sub">点击上方输入框，添加你的第一个任务吧</p>
      </div>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id} className="task-list__item">
          <TaskItem task={task} onUpdated={onUpdated} onDeleted={onDeleted} />
        </li>
      ))}
    </ul>
  );
}
