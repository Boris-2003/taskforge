// TaskFilter：胶囊样式的状态筛选按钮组

import { TaskStatus } from '../api/tasks';

export type FilterValue = TaskStatus | undefined;

interface TaskFilterProps {
  current: FilterValue;
  onChange: (value: FilterValue) => void;
  counts: { all: number; todo: number; 'in-progress': number; done: number };
}

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: '全部', value: undefined },
  { label: '待办', value: 'todo' },
  { label: '进行中', value: 'in-progress' },
  { label: '已完成', value: 'done' },
];

export default function TaskFilter({ current, onChange, counts }: TaskFilterProps) {
  function getCount(value: FilterValue): number {
    if (value === undefined) return counts.all;
    if (value === 'in-progress') return counts['in-progress'];
    return counts[value];
  }

  return (
    <div className="filter-group">
      {FILTERS.map(({ label, value }) => (
        <button
          key={label}
          className={`filter-btn ${current === value ? 'filter-btn--active' : ''}`}
          onClick={() => onChange(value)}
        >
          {label}
          <span className="filter-btn__count">{getCount(value)}</span>
        </button>
      ))}
    </div>
  );
}
