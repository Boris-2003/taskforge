// TaskForm：新建任务的表单组件，包含标题输入、描述输入和提交按钮

import { useState } from 'react';
import { createTask } from '../api/tasks';

interface TaskFormProps {
  onCreated: () => void; // 创建成功后通知父组件刷新列表
}

export default function TaskForm({ onCreated }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError('');
    try {
      await createTask(title.trim(), description.trim());
      setTitle('');
      setDescription('');
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="task-form__fields">
        <input
          className="input"
          type="text"
          placeholder="任务标题（必填）"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />
        <input
          className="input"
          type="text"
          placeholder="任务描述（可选）"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />
        {/* 标题为空时禁用按钮 */}
        <button
          className="btn btn--primary"
          type="submit"
          disabled={!title.trim() || loading}
        >
          {loading ? '添加中…' : '+ 添加任务'}
        </button>
      </div>
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
