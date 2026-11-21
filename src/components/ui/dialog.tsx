import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BaseProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  /** Impede fechar clicando fora (ex.: cronômetro em andamento). */
  persistent?: boolean;
}

function useDialogBehavior(open: boolean, onClose: () => void, panel: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const t = window.setTimeout(() => {
      const el = panel.current?.querySelector<HTMLElement>('[data-autofocus], input, textarea, select, button');
      el?.focus();
    }, 30);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [open, onClose, panel]);
}

export function Modal({ open, onClose, title, description, children, footer, className, persistent }: BaseProps) {
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  useDialogBehavior(open, onClose, panel);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 animate-fade-in bg-black/80" onClick={persistent ? undefined : onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-t`}
        className={cn(
          'relative z-10 flex max-h-[92vh] w-full max-w-lg animate-fade-in flex-col rounded-t-md border border-line bg-surface sm:rounded-md',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line p-4">
          <div className="min-w-0">
            <h2 id={`${id}-t`} className="text-base font-semibold text-ink">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-xs text-ink-muted">{description}</p>}
          </div>
          <button onClick={onClose} className="rounded-sm p-1 text-ink-muted hover:bg-surface-2 hover:text-ink" aria-label="Fechar">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-4">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line p-4">{footer}</div>}
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, title, description, children, footer, className }: BaseProps) {
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  useDialogBehavior(open, onClose, panel);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 animate-fade-in bg-black/75" onClick={onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-t`}
        className={cn(
          'relative z-10 flex h-full w-full max-w-xl animate-slide-in flex-col border-l border-line bg-surface',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line p-4">
          <div className="min-w-0">
            <h2 id={`${id}-t`} className="text-base font-semibold text-ink">
              {title}
            </h2>
            {description && <div className="mt-1 text-xs text-ink-muted">{description}</div>}
          </div>
          <button onClick={onClose} className="rounded-sm p-1 text-ink-muted hover:bg-surface-2 hover:text-ink" aria-label="Fechar">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line p-4">{footer}</div>}
      </div>
    </div>
  );
}
