import { Scale } from 'lucide-react';
import { DISCIPLINES, DISCURSIVA_MAX, TOTAL_MAX, WEEKLY_SCHEDULE } from '../../data/editalData';
import { useStudyStore } from '../../hooks/useStudyStore';
import { cn, fmtHours, fmtPct } from '../../lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

/** Minutos semanais planejados por disciplina, a partir da grade. */
function plannedWeekly(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const day of WEEKLY_SCHEDULE) {
    for (const b of day.blocks) {
      const alloc = b.allocation ?? { [b.disciplineIds[0]]: b.minutes };
      for (const [id, m] of Object.entries(alloc)) out[id] = (out[id] ?? 0) + m;
    }
  }
  return out;
}

export function AllocationCard({ className }: { className?: string }) {
  const { state } = useStudyStore();
  const planned = plannedWeekly();
  const weekTotal = Object.values(planned).reduce((a, b) => a + b, 0);

  const realized: Record<string, number> = {};
  for (const s of state.sessions) realized[s.disciplineId] = (realized[s.disciplineId] ?? 0) + s.minutes;
  const realizedTotal = Object.values(realized).reduce((a, b) => a + b, 0);

  const rows = [
    ...DISCIPLINES.map((d) => ({ id: d.id, name: d.short, points: d.questions * d.weight, estimated: d.estimated })),
    { id: 'discursiva', name: 'Discursiva', points: DISCURSIVA_MAX, estimated: false },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-ink" /> Tempo do plano × peso na nota
        </CardTitle>
        <CardDescription>
          Participação de cada disciplina nas {fmtHours(weekTotal)} semanais comparada à sua fatia dos {TOTAL_MAX} pontos (objetiva + discursiva).
        </CardDescription>
        <div className="mt-1 flex gap-4 text-[11px] text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-3 bg-ink-dim" /> % do tempo planejado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-3 bg-ink" /> % dos pontos
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {rows.map((r) => {
          const timePct = ((planned[r.id] ?? 0) / weekTotal) * 100;
          const ptsPct = (r.points / TOTAL_MAX) * 100;
                    const gap = timePct - ptsPct;
          const realPct = realizedTotal ? ((realized[r.id] ?? 0) / realizedTotal) * 100 : null;
          return (
            <div key={r.id} className="grid grid-cols-[7.5rem_1fr_4.5rem] items-center gap-2 text-xs">
              <span className="truncate text-ink-muted" title={r.name}>
                {r.name}
                {r.estimated && <span className="text-ink-dim">*</span>}
              </span>
              <div className="space-y-1" title={`Tempo: ${fmtPct(timePct, 1)} · Pontos: ${fmtPct(ptsPct, 1)}${realPct !== null ? ` · Realizado: ${fmtPct(realPct, 1)}` : ''}`}>
                <div className="h-1 bg-line">
                  <div className="h-full bg-ink-dim" style={{ width: `${Math.min(100, timePct * 2)}%` }} />
                </div>
                <div className="h-1 bg-line">
                  <div className="h-full bg-ink" style={{ width: `${Math.min(100, ptsPct * 2)}%` }} />
                </div>
              </div>
              <span
                className={cn('text-right font-mono tabular-nums', Math.abs(gap) < 3 ? 'text-ink-dim' : gap > 0 ? 'text-ink-muted' : 'font-semibold text-ink')}
                title={gap > 0 ? 'Recebe mais tempo do que pesa na nota' : 'Recebe menos tempo do que pesa na nota'}
              >
                {gap > 0 ? '+' : ''}
                {gap.toFixed(0)}&nbsp;p.p.
              </span>
            </div>
          );
        })}
        <p className="pt-1 text-[11px] leading-relaxed text-ink-dim">
          Escala das barras: 50% = largura total. Coluna da direita = diferença entre fatia de tempo e fatia de pontos (vermelho: subdimensionada). * Divisão
          60 questões entre TI e Criminalística/ML é estimativa — o edital não a fixa. Peso não é o único critério: considere também o nível atual em cada
          matéria e o mínimo eliminatório (1 ponto por disciplina básica/jurídica).
        </p>
      </CardContent>
    </Card>
  );
}
