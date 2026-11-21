import { Scale } from 'lucide-react';
import { DISCIPLINES, DISCURSIVA_MAX, TOTAL_MAX, WEEKLY_SCHEDULE, trackBlock } from '../../data/editalData';
import { useStudyStore } from '../../hooks/useStudyStore';
import { TONE } from '../../lib/theme';
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
          <Scale className="h-4 w-4 text-cyan-300" /> Tempo do plano × peso na nota
        </CardTitle>
        <CardDescription>
          Participação de cada disciplina nas {fmtHours(weekTotal)} semanais comparada à sua fatia dos {TOTAL_MAX} pontos (objetiva + discursiva).
        </CardDescription>
        <div className="mt-1 flex gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-sm bg-slate-400" /> % do tempo planejado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-3 rounded-sm bg-gradient-to-r from-cyan-400 via-amber-400 to-emerald-400" /> % dos pontos
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {rows.map((r) => {
          const timePct = ((planned[r.id] ?? 0) / weekTotal) * 100;
          const ptsPct = (r.points / TOTAL_MAX) * 100;
          const tone = TONE[trackBlock(r.id)];
          const gap = timePct - ptsPct;
          const realPct = realizedTotal ? ((realized[r.id] ?? 0) / realizedTotal) * 100 : null;
          return (
            <div key={r.id} className="grid grid-cols-[7.5rem_1fr_3.5rem] items-center gap-2 text-xs">
              <span className="truncate text-slate-300" title={r.name}>
                {r.name}
                {r.estimated && <span className="text-slate-500">*</span>}
              </span>
              <div className="space-y-1" title={`Tempo: ${fmtPct(timePct, 1)} · Pontos: ${fmtPct(ptsPct, 1)}${realPct !== null ? ` · Realizado: ${fmtPct(realPct, 1)}` : ''}`}>
                <div className="h-1.5 rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-slate-400" style={{ width: `${Math.min(100, timePct * 2)}%` }} />
                </div>
                <div className="h-1.5 rounded-full bg-slate-800">
                  <div className={cn('h-full rounded-full', tone.bar)} style={{ width: `${Math.min(100, ptsPct * 2)}%` }} />
                </div>
              </div>
              <span
                className={cn('text-right tabular-nums', Math.abs(gap) < 3 ? 'text-slate-400' : gap > 0 ? 'text-yellow-200' : 'text-rose-300')}
                title={gap > 0 ? 'Recebe mais tempo do que pesa na nota' : 'Recebe menos tempo do que pesa na nota'}
              >
                {gap > 0 ? '+' : ''}
                {gap.toFixed(0)} p.p.
              </span>
            </div>
          );
        })}
        <p className="pt-1 text-[11px] leading-relaxed text-slate-500">
          Escala das barras: 50% = largura total. Coluna da direita = diferença entre fatia de tempo e fatia de pontos (vermelho: subdimensionada). * Divisão
          60 questões entre TI e Criminalística/ML é estimativa — o edital não a fixa. Peso não é o único critério: considere também o nível atual em cada
          matéria e o mínimo eliminatório (1 ponto por disciplina básica/jurídica).
        </p>
      </CardContent>
    </Card>
  );
}
