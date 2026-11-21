import type { BlockId } from '../types';

export type Tone = BlockId | 'extra';

/** Classes estáticas (Tailwind precisa enxergá-las literalmente). */
export const TONE: Record<
  Tone,
  { text: string; bg: string; soft: string; ring: string; bar: string; dot: string; border: string; label: string }
> = {
  especificos: {
    text: 'text-cyan-300',
    bg: 'bg-cyan-500',
    soft: 'bg-cyan-500/10',
    ring: 'ring-cyan-500/30',
    bar: 'bg-cyan-400',
    dot: 'bg-cyan-400',
    border: 'border-cyan-500/40',
    label: 'Específicos · peso 2',
  },
  basicos: {
    text: 'text-amber-300',
    bg: 'bg-amber-500',
    soft: 'bg-amber-500/10',
    ring: 'ring-amber-500/30',
    bar: 'bg-amber-400',
    dot: 'bg-amber-400',
    border: 'border-amber-500/40',
    label: 'Básicos · peso 1',
  },
  juridicos: {
    text: 'text-emerald-300',
    bg: 'bg-emerald-500',
    soft: 'bg-emerald-500/10',
    ring: 'ring-emerald-500/30',
    bar: 'bg-emerald-400',
    dot: 'bg-emerald-400',
    border: 'border-emerald-500/40',
    label: 'Jurídicos · peso 1',
  },
  extra: {
    text: 'text-violet-300',
    bg: 'bg-violet-500',
    soft: 'bg-violet-500/10',
    ring: 'ring-violet-500/30',
    bar: 'bg-violet-400',
    dot: 'bg-violet-400',
    border: 'border-violet-500/40',
    label: 'Discursiva / Simulado',
  },
};
