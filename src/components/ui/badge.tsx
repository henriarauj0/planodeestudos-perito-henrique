import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type Variant = 'tag' | 'solid' | 'muted';

const variants: Record<Variant, string> = {
  /** Etiqueta de evidência: borda 1px, mono, caixa alta. */
  tag: 'border border-line-strong text-ink-muted bg-transparent',
  /** Destaque de alto contraste. */
  solid: 'border border-white bg-white text-canvas',
  muted: 'border border-line text-ink-dim bg-surface-2',
};

export function Badge({ className, variant = 'tag', ...props }: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-sm px-1.5 py-[3px] font-mono text-[10px] font-medium uppercase leading-none tracking-[0.08em]',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
