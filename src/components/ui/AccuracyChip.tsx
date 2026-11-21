import { ACCURACY_CLASSES, ACCURACY_DOT, accuracyTone, cn, fmtPct } from '../../lib/utils';

/** % de acerto com marcador de status (verde ≥ 80, âmbar 60–79, vermelho < 60). */
export function AccuracyChip({ value, className, digits = 0 }: { value: number | null; className?: string; digits?: number }) {
  const tone = accuracyTone(value);
  return (
    <span
      className={cn(
        'inline-flex h-7 min-w-[3.5rem] items-center justify-center gap-1.5 rounded-sm border bg-canvas px-1.5 font-mono text-xs font-medium tabular-nums',
        ACCURACY_CLASSES[tone],
        className,
      )}
      title={tone === 'bad' ? 'Abaixo de 60%' : tone === 'mid' ? 'Entre 60% e 79%' : tone === 'good' ? '80% ou mais' : 'Sem questões'}
    >
      <span className={cn('h-1.5 w-1.5 shrink-0', ACCURACY_DOT[tone])} aria-hidden />
      {fmtPct(value, digits)}
    </span>
  );
}
