import type { BlockId } from '../types';

export type Tone = BlockId | 'extra';

/**
 * Identidade dos blocos em escala de cinza: quanto maior o peso, mais claro o traço.
 * A identificação principal é feita por etiquetas (badges), nunca só pela cor.
 */
export const TONE: Record<Tone, { text: string; bar: string; dot: string; border: string; code: string; label: string }> = {
  especificos: { text: 'text-ink', bar: 'bg-ink', dot: 'bg-ink', border: 'border-l-ink', code: 'ESP', label: 'Específicos · peso 2' },
  basicos: { text: 'text-ink-muted', bar: 'bg-ink-muted', dot: 'bg-ink-muted', border: 'border-l-ink-muted', code: 'BAS', label: 'Básicos · peso 1' },
  juridicos: { text: 'text-ink-muted', bar: 'bg-ink-dim', dot: 'bg-ink-dim', border: 'border-l-ink-dim', code: 'JUR', label: 'Jurídicos · peso 1' },
  extra: { text: 'text-ink-muted', bar: 'bg-ink-faint', dot: 'bg-ink-faint', border: 'border-l-ink-faint', code: 'DSC', label: 'Discursiva / Simulado' },
};

export const PRIORITY_LABEL = {
  alta: 'Prioridade alta',
  media: 'Prioridade média',
  baixa: 'Prioridade baixa',
  revisao: 'Modo revisão',
} as const;
