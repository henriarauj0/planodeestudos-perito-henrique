import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  code?: string;
  icon?: ReactNode;
}

export function Tabs<T extends string>({ items, value, onChange }: { items: TabItem<T>[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="-mb-px flex w-full overflow-x-auto sm:w-auto">
      {items.map((it) => (
        <button
          key={it.id}
          role="tab"
          aria-selected={value === it.id}
          onClick={() => onChange(it.id)}
          className={cn(
            '-mb-px flex flex-1 items-center justify-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors sm:flex-none',
            value === it.id ? 'border-white text-ink' : 'border-transparent text-ink-dim hover:text-ink-muted',
          )}
        >
          {it.code && <span className="font-mono text-[10px] text-ink-faint">{it.code}</span>}
          {it.icon}
          {it.label}
        </button>
      ))}
    </div>
  );
}
