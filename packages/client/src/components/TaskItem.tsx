// TaskItem：单条任务卡片，左侧彩色状态条，支持状态切换和删除（含淡出动画）

import { useState } from 'react';
import { Task, TaskStatus, updateTask, deleteTask } from '../api/tasks';

interface TaskItemProps {
  task: Task;
  onUpdated: () => void;
  onDeleted: () => void;
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: '待办',
  'in-progress': '进行中',
  done: '已完成',
};

const STATUS_OPTIONS: TaskStatus[] = ['todo', 'in-progress', 'done'];

export default function TaskItem({ task, onUpdated, onDeleted }: TaskItemProps) {
  const [updating, setUpdating] = useState(false);
  const [removing, setRemoving] = useState(false); // 触发淡出动画

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value as TaskStatus;
    setUpdating(true);
    try {
      await updateTask(task.id, { status });
      onUpdated();
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`确认删除任务「${task.title}」？`)) return;
    // 先触发淡出动画，300ms 后才发请求
    setRemoving(true);
    await new Promise((r) => setTimeout(r, 280));
    try {
      await deleteTask(task.id);
      onDeleted();
    } catch {
      setRemoving(false); // 删除失败，恢复显示
    }
  }

  const isDone = task.status === 'done';

  return (
    <div className={`task-card task-card--${task.status} ${isDone ? 'task-card--done' : ''} ${removing ? 'task-card--removing' : ''}`}>
      {/* 左侧彩色状态条 */}
      <div className="task-card__bar" />

      <div className="task-card__body">
        <p className={`task-card__title ${isDone ? 'task-card__title--done' : ''}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="task-card__desc">{task.description}</p>
        )}
      </div>

      <div className="task-card__actions">
        <select
          className="select"
          value={task.status}
          onChange={handleStatusChange}
          disabled={updating || removing}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <button
          className="btn btn--ghost-danger"
          onClick={handleDelete}
          disabled={updating || removing}
        >
          删除
        </button>
      </div>
    </div>
  );
}
