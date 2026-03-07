// TaskForm：新建任务的表单组件，含前端校验

import { useState } from 'react';
import { createTask } from '../api/tasks';

interface TaskFormProps {
  onCreated: () => void;
}

export default function TaskForm({ onCreated }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function validateTitle(value: string): string {
    if (!value.trim()) return '标题不能为空';
    if (value.trim().length > 100) return '标题最多 100 个字符';
    return '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateTitle(title);
    if (err) { setTitleError(err); return; }

    setLoading(true);
    setError('');
    try {
      await createTask(title.trim(), description.trim());
      setTitle('');
      setDescription('');
      setTitleError('');
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="task-form-card">
      <h2 className="task-form-card__title">添加任务</h2>
      <form onSubmit={handleSubmit}>
        <div className="task-form__row">
          <div className="task-form__field">
            <input
              className={`input ${titleError ? 'input--error' : ''}`}
              type="text"
              placeholder="任务标题（必填，最多 100 字）"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setTitleError(validateTitle(e.target.value)); }}
              disabled={loading}
            />
            {titleError && <p className="field-error">{titleError}</p>}
          </div>
          <input
            className="input"
            type="text"
            placeholder="任务描述（可选，最多 500 字）"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            maxLength={500}
          />
          <button
            className="btn btn--primary"
            type="submit"
            disabled={!title.trim() || loading}
          >
            {loading ? <><span className="spinner" /> 添加中…</> : '+ 添加'}
          </button>
        </div>
        {error && <p className="field-error" style={{ marginTop: 8 }}>{error}</p>}
      </form>
    </div>
  );
}
