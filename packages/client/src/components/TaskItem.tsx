// TaskItem：单条任务卡片，支持切换状态和删除操作

import { useState } from 'react';
import { Task, TaskStatus, updateTask, deleteTask } from '../api/tasks';

interface TaskItemProps {
  task: Task;
  onUpdated: () => void; // 操作成功后通知父组件刷新
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
  const [deleting, setDeleting] = useState(false);

  /** 切换状态下拉框 */
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

  /** 删除前弹窗二次确认 */
  async function handleDelete() {
    if (!window.confirm(`确认删除任务「${task.title}」？`)) return;
    setDeleting(true);
    try {
      await deleteTask(task.id);
      onDeleted();
    } finally {
      setDeleting(false);
    }
  }

  const isDone = task.status === 'done';

  return (
    <div className={`task-item ${isDone ? 'task-item--done' : ''}`}>
      <div className="task-item__body">
        {/* 已完成的任务标题加删除线 */}
        <p className={`task-item__title ${isDone ? 'task-item__title--done' : ''}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="task-item__desc">{task.description}</p>
        )}
      </div>

      <div className="task-item__actions">
        <select
          className="select"
          value={task.status}
          onChange={handleStatusChange}
          disabled={updating || deleting}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        <button
          className="btn btn--danger"
          onClick={handleDelete}
          disabled={updating || deleting}
        >
          {deleting ? '删除中…' : '删除'}
        </button>
      </div>
    </div>
  );
}
