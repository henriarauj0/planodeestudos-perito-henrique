import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Converte valor de input em inteiro não negativo. */
export function toInt(v: string | number, max = 99999): number {
  const n = typeof v === 'number' ? v : parseInt(v, 10);
  if (!Number.isFinite(n)) return 0;
  return clamp(Math.round(n), 0, max);
}

export function toNum(v: string | number, max = 99999): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
  if (!Number.isFinite(n)) return 0;
  return clamp(n, 0, max);
}

export function pct(part: number, total: number): number | null {
  if (!total) return null;
  return (part / total) * 100;
}

export function fmtPct(v: number | null, digits = 0): string {
  if (v === null || Number.isNaN(v)) return '—';
  return `${v.toFixed(digits).replace('.', ',')}%`;
}

export function fmtNum(v: number, digits = 1): string {
  return v.toLocaleString('pt-BR', { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}

export function fmtHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}min`;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

export function fmtClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Classe de cor do % de acerto: vermelho < 60, amarelo 60–79, verde ≥ 80. */
export function accuracyTone(v: number | null): 'none' | 'bad' | 'mid' | 'good' {
  if (v === null) return 'none';
  if (v < 60) return 'bad';
  if (v < 80) return 'mid';
  return 'good';
}

export const ACCURACY_CLASSES: Record<ReturnType<typeof accuracyTone>, string> = {
  none: 'text-slate-500 bg-slate-800/60 ring-slate-700',
  bad: 'text-rose-300 bg-rose-500/10 ring-rose-500/30',
  mid: 'text-yellow-200 bg-yellow-500/10 ring-yellow-500/30',
  good: 'text-emerald-300 bg-emerald-500/10 ring-emerald-500/30',
};
