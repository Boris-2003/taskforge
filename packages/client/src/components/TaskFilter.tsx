// TaskFilter：状态筛选组件，提供"全部 / 待办 / 进行中 / 已完成"四个切换按钮

import { TaskStatus } from '../api/tasks';

// undefined 表示"全部"
export type FilterValue = TaskStatus | undefined;

interface TaskFilterProps {
  current: FilterValue;
  onChange: (value: FilterValue) => void;
}

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: '全部', value: undefined },
  { label: '待办', value: 'todo' },
  { label: '进行中', value: 'in-progress' },
  { label: '已完成', value: 'done' },
];

export default function TaskFilter({ current, onChange }: TaskFilterProps) {
  return (
    <div className="task-filter">
      {FILTERS.map(({ label, value }) => (
        <button
          key={label}
          className={`btn task-filter__btn ${current === value ? 'task-filter__btn--active' : ''}`}
          onClick={() => onChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
