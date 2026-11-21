import { DISCIPLINES, EXAM_BLOCKS, OBJECTIVE_MAX, OBJECTIVE_MIN, PROFILE } from '../../data/editalData';
import { useStudyStore } from '../../hooks/useStudyStore';
import { useNow } from '../../hooks/useNow';
import { parseISODate, plannedMinutesUntil, toISODate } from '../../lib/dates';
import {
  allDisciplineStats,
  blockQuestionStats,
  GOAL_MINUTES,
  overallAccuracy,
  projectedObjective,
  totalStudyMinutes,
  weightedProgress,
} from '../../lib/metrics';
import { TONE } from '../../lib/theme';
import { ACCURACY_DOT, accuracyTone, cn, fmtHours, fmtNum, fmtPct } from '../../lib/utils';
import { AccuracyChip } from '../ui/AccuracyChip';
import { Progress } from '../ui/progress';

function Kpi({ code, title, children, className }: { code: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3 bg-surface p-4', className)}>
      <div className="flex items-center justify-between">
        <span className="label-caps">{title}</span>
        <span className="font-mono text-[10px] text-ink-faint">{code}</span>
      </div>
      {children}
    </div>
  );
}

function Countdown() {
  const now = useNow(1000);
  const exam = new Date(PROFILE.examStartUtc).getTime();
  const diff = Math.max(0, exam - now.getTime());
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  const weeks = diff / (7 * 86_400_000);

  const start = parseISODate(PROFILE.startDate);
  const examDay = parseISODate(PROFILE.examDate);
  const planDays = Math.round((examDay.getTime() - start.getTime()) / 86_400_000);
  const today = parseISODate(toISODate(now));
  const dayOfPlan = Math.round((today.getTime() - start.getTime()) / 86_400_000) + 1;
  const started = dayOfPlan >= 1;

  const units = [
    { v: days, l: 'Dias' },
    { v: hours, l: 'Horas' },
    { v: minutes, l: 'Min' },
    { v: seconds, l: 'Seg' },
  ];

  return (
    <Kpi code="K-01" title="Contagem regressiva">
      {diff === 0 ? (
        <p className="text-xl font-semibold text-ink">Dia de prova.</p>
      ) : (
        <div className="grid grid-cols-4 divide-x divide-line border border-line">
          {units.map((u) => (
            <div key={u.l} className="px-1 py-2 text-center">
              <div className="num text-2xl font-medium text-ink">{String(u.v).padStart(2, '0')}</div>
              <div className="label-caps mt-0.5 text-[9px]">{u.l}</div>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
        <span>
          <span className="num text-ink">{fmtNum(weeks, 1)}</span> semanas
        </span>
        <span>
          {started ? (
            <>
              Dia <span className="num text-ink">{String(Math.min(dayOfPlan, planDays)).padStart(2, '0')}</span>
              <span className="num">/{planDays}</span>
            </>
          ) : (
            <>Início em {start.toLocaleDateString('pt-BR')}</>
          )}
        </span>
      </div>
    </Kpi>
  );
}

export function KpiCards() {
  const { state } = useStudyStore();
  const now = useNow(60_000);
  const stats = allDisciplineStats(state);
  const progress = weightedProgress(stats) * 100;

  const minutes = totalStudyMinutes(state);
  const expected = plannedMinutesUntil(now);
  const delta = minutes - expected;

  const acc = overallAccuracy(stats);
  const threshold = state.settings.alertThreshold;
  const below = DISCIPLINES.filter((d) => {
    const s = stats[d.id];
    return s.accuracy !== null && s.accuracy < threshold;
  });
  const proj = projectedObjective(stats);

  return (
    <section className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores">
      <Countdown />

      <Kpi code="K-02" title="Progresso do edital">
        <div className="flex items-baseline justify-between gap-2">
          <span className="num text-3xl font-medium text-ink">{fmtPct(progress, 1)}</span>
          <span className="label-caps text-[9px]">Ponderado q × peso</span>
        </div>
        <Progress value={progress} label="Progresso geral ponderado" />
        <div className="space-y-1.5">
          {EXAM_BLOCKS.map((b) => {
            const v = weightedProgress(stats, b.id) * 100;
            return (
              <div key={b.id} className="flex items-center gap-2 text-xs">
                <span className="w-8 shrink-0 font-mono text-[10px] text-ink-dim">{TONE[b.id].code}</span>
                <span className="w-20 shrink-0 truncate text-ink-muted">{b.name.replace('Conhecimentos ', '')}</span>
                <Progress value={v} className="h-[3px]" barClassName={TONE[b.id].bar} label={b.name} />
                <span className="num w-10 shrink-0 text-right text-ink-muted">{fmtPct(v)}</span>
              </div>
            );
          })}
        </div>
      </Kpi>

      <Kpi code="K-03" title="Horas líquidas">
        <div className="flex items-baseline justify-between gap-2">
          <span className="num text-3xl font-medium text-ink">
            {fmtHours(minutes)}
            <span className="text-base text-ink-dim"> / {PROFILE.totalHoursGoal}h</span>
          </span>
          <span className="num text-xs text-ink-muted">{fmtPct((minutes / GOAL_MINUTES) * 100)}</span>
        </div>
        <Progress value={(minutes / GOAL_MINUTES) * 100} marker={(expected / GOAL_MINUTES) * 100} label="Horas estudadas sobre a meta" />
        <dl className="grid grid-cols-2 gap-px border border-line bg-line text-xs">
          <div className="bg-surface px-2 py-1.5">
            <dt className="label-caps text-[9px]">Previsto até hoje</dt>
            <dd className="num mt-0.5 text-ink">{fmtHours(expected)}</dd>
          </div>
          <div className="bg-surface px-2 py-1.5">
            <dt className="label-caps text-[9px]">Saldo</dt>
            <dd className="num mt-0.5 flex items-center gap-1.5 text-ink">
              {expected === 0 ? (
                '—'
              ) : (
                <>
                  <span className={cn('h-1.5 w-1.5', delta >= 0 ? 'bg-ok' : 'bg-bad')} aria-hidden />
                  {delta >= 0 ? '+' : '−'}
                  {fmtHours(Math.abs(delta))}
                </>
              )}
            </dd>
          </div>
        </dl>
      </Kpi>

      <Kpi code="K-04" title="Taxa de acerto">
        <div className="flex items-baseline justify-between gap-2">
          <span className="num text-3xl font-medium text-ink">{fmtPct(acc.accuracy, 1)}</span>
          <span className="num text-xs text-ink-muted">
            {acc.correct}/{acc.questions} q
          </span>
        </div>
        <div className="grid grid-cols-3 gap-px border border-line bg-line">
          {EXAM_BLOCKS.map((b) => {
            const q = blockQuestionStats(stats, b.id);
            return (
              <div key={b.id} className="bg-surface px-2 py-1.5">
                <div className="font-mono text-[10px] text-ink-dim">{TONE[b.id].code}</div>
                <div className="num mt-0.5 flex items-center gap-1.5 text-sm text-ink">
                  <span className={cn('h-1.5 w-1.5', ACCURACY_DOT[accuracyTone(q.accuracy)])} aria-hidden />
                  {fmtPct(q.accuracy)}
                </div>
              </div>
            );
          })}
        </div>
        {below.length > 0 ? (
          <div className="border border-bad bg-canvas p-2">
            <p className="label-caps text-[9px] text-ink">
              <span className="mr-1.5 inline-block h-1.5 w-1.5 bg-bad align-middle" aria-hidden />
              Alerta · abaixo de {threshold}%
            </p>
            <ul className="mt-1.5 space-y-1">
              {below.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-2 text-xs text-ink-muted">
                  <span className="truncate">{d.short}</span>
                  <AccuracyChip value={stats[d.id].accuracy} className="h-6" />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-xs text-ink-dim">
            {acc.questions > 0 ? `Nenhuma disciplina abaixo de ${threshold}%.` : 'Registre questões para ativar o alerta por disciplina.'}
          </p>
        )}
        {proj.scaled !== null && (
          <p className="text-[11px] text-ink-dim">
            Projeção objetiva: <span className="num text-ink-muted">{fmtNum(proj.scaled, 0)}/{OBJECTIVE_MAX}</span> · corte {OBJECTIVE_MIN}
            {!proj.full && ' · parcial'}
          </p>
        )}
      </Kpi>
    </section>
  );
}
