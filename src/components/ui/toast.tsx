import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

type ToastKind = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

const ToastCtx = createContext<(message: string, kind?: ToastKind) => void>(() => {});

const MARK: Record<ToastKind, string> = { success: 'bg-ok', error: 'bg-bad', info: 'bg-ink-muted' };
const CODE: Record<ToastKind, string> = { success: 'OK', error: 'ERRO', info: 'INFO' };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = Date.now() + Math.random();
    setItems((xs) => [...xs.slice(-2), { id, kind, message }]);
    window.setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 3500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 left-4 z-[60] flex flex-col gap-2">
        {items.map((t) => (
          <div key={t.id} className="pointer-events-auto flex max-w-sm animate-fade-in items-stretch overflow-hidden rounded-md border border-line bg-surface-2 text-sm text-ink">
            <span className={cn('w-1 shrink-0', MARK[t.kind])} />
            <span className="flex items-center gap-2 px-3 py-2">
              <span className="font-mono text-[10px] tracking-widest text-ink-dim">{CODE[t.kind]}</span>
              {t.message}
            </span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
