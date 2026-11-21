import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: ReactNode;
}

export function Tabs<T extends string>({ items, value, onChange }: { items: TabItem<T>[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="flex w-full gap-1 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/70 p-1 sm:w-auto">
      {items.map((it) => (
        <button
          key={it.id}
          role="tab"
          aria-selected={value === it.id}
          onClick={() => onChange(it.id)}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:flex-none',
            value === it.id ? 'bg-slate-800 text-slate-50 shadow ring-1 ring-slate-700' : 'text-slate-400 hover:text-slate-200',
          )}
        >
          {it.icon}
          {it.label}
        </button>
      ))}
    </div>
  );
}
