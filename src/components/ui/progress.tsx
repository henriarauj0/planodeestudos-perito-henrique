import { cn } from '../../lib/utils';

interface Props {
  value: number; // 0..100
  className?: string;
  barClassName?: string;
  /** Marcador opcional (0..100), ex.: meta esperada até hoje. */
  marker?: number;
  label?: string;
}

export function Progress({ value, className, barClassName, marker, label }: Props) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v)}
      aria-label={label}
      className={cn('relative h-1 w-full overflow-hidden rounded-[1px] bg-line', className)}
    >
      <div className={cn('h-full bg-ink transition-[width] duration-500', barClassName)} style={{ width: `${v}%` }} />
      {marker !== undefined && (
        <div
          className="absolute top-0 h-full w-0.5 bg-ink-muted"
          style={{ left: `calc(${Math.max(0, Math.min(100, marker))}% - 1px)` }}
          title="Esperado até hoje"
        />
      )}
    </div>
  );
}
