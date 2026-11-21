import { AlertTriangle, CheckCircle2, Clock, Hourglass, Target, TrendingUp } from 'lucide-react';
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
import { cn, fmtHours, fmtNum, fmtPct } from '../../lib/utils';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';

function Kpi({ icon, title, children, className }: { icon: React.ReactNode; title: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={cn('flex flex-col gap-3 p-4', className)}>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
        {icon}
        {title}
      </div>
      {children}
    </Card>
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
    { v: days, l: 'dias' },
    { v: hours, l: 'horas' },
    { v: minutes, l: 'min' },
    { v: seconds, l: 'seg' },
  ];

  return (
    <Kpi icon={<Hourglass className="h-3.5 w-3.5 text-cyan-300" />} title="Contagem regressiva" className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl" />
      {diff === 0 ? (
        <p className="text-2xl font-semibold text-cyan-300">Dia de prova. Boa sorte!</p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {units.map((u) => (
            <div key={u.l} className="rounded-lg bg-slate-950/60 px-1 py-2 text-center ring-1 ring-slate-800">
              <div className="text-2xl font-semibold tabular-nums text-slate-50">{String(u.v).padStart(2, '0')}</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">{u.l}</div>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <span>
          <span className="font-semibold text-slate-200">{fmtNum(weeks, 1)}</span> semanas restantes
        </span>
        <span>
          {started ? (
            <>
              Dia <span className="font-semibold text-slate-200">{Math.min(dayOfPlan, planDays)}</span> de {planDays}
            </>
          ) : (
            <>Plano começa em {start.toLocaleDateString('pt-BR')}</>
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
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores">
      <Countdown />

      <Kpi icon={<TrendingUp className="h-3.5 w-3.5 text-cyan-300" />} title="Progresso do edital">
        <div className="flex items-end justify-between">
          <span className="text-3xl font-semibold tabular-nums text-slate-50">{fmtPct(progress, 1)}</span>
          <span className="pb-1 text-[11px] text-slate-500">ponderado por questões × peso</span>
        </div>
        <Progress value={progress} label="Progresso geral ponderado" />
        <div className="space-y-1.5">
          {EXAM_BLOCKS.map((b) => {
            const v = weightedProgress(stats, b.id) * 100;
            return (
              <div key={b.id} className="flex items-center gap-2 text-xs">
                <span className={cn('h-2 w-2 shrink-0 rounded-full', TONE[b.id].dot)} />
                <span className="w-24 shrink-0 truncate text-slate-400">{b.name.replace('Conhecimentos ', '')}</span>
                <Progress value={v} className="h-1" barClassName={TONE[b.id].bar} label={b.name} />
                <span className="w-10 shrink-0 text-right tabular-nums text-slate-300">{fmtPct(v)}</span>
              </div>
            );
          })}
        </div>
      </Kpi>

      <Kpi icon={<Clock className="h-3.5 w-3.5 text-cyan-300" />} title="Horas líquidas">
        <div className="flex items-end justify-between">
          <span className="text-3xl font-semibold tabular-nums text-slate-50">
            {fmtHours(minutes)}
            <span className="text-base font-normal text-slate-500"> / {PROFILE.totalHoursGoal}h</span>
          </span>
          <span className="pb-1 text-xs tabular-nums text-slate-400">{fmtPct((minutes / GOAL_MINUTES) * 100)}</span>
        </div>
        <Progress value={(minutes / GOAL_MINUTES) * 100} marker={(expected / GOAL_MINUTES) * 100} label="Horas estudadas sobre a meta" />
        <p className="text-xs text-slate-400">
          Esperado até hoje: <span className="text-slate-200">{fmtHours(expected)}</span>.{' '}
          {expected === 0 ? (
            <span>O plano ainda não começou.</span>
          ) : delta >= 0 ? (
            <span className="text-emerald-300">{fmtHours(delta)} à frente do plano</span>
          ) : (
            <span className="text-rose-300">{fmtHours(-delta)} atrás do plano</span>
          )}
        </p>
      </Kpi>

      <Kpi icon={<Target className="h-3.5 w-3.5 text-cyan-300" />} title="Taxa de acerto">
        <div className="flex items-end justify-between">
          <span className="text-3xl font-semibold tabular-nums text-slate-50">{fmtPct(acc.accuracy, 1)}</span>
          <span className="pb-1 text-xs text-slate-400">
            {acc.correct}/{acc.questions} questões
          </span>
        </div>
        <div className="flex gap-1.5">
          {EXAM_BLOCKS.map((b) => {
            const q = blockQuestionStats(stats, b.id);
            return (
              <div key={b.id} className={cn('flex-1 rounded-md px-2 py-1 ring-1', TONE[b.id].soft, TONE[b.id].ring)}>
                <div className="text-[10px] text-slate-400">{b.name.replace('Conhecimentos ', '')}</div>
                <div className={cn('text-sm font-semibold tabular-nums', TONE[b.id].text)}>{fmtPct(q.accuracy)}</div>
              </div>
            );
          })}
        </div>
        {below.length > 0 ? (
          <div className="rounded-lg bg-rose-500/10 p-2 ring-1 ring-rose-500/30">
            <p className="flex items-center gap-1.5 text-xs font-medium text-rose-200">
              <AlertTriangle className="h-3.5 w-3.5" /> Abaixo de {threshold}% (meta de corte pessoal):
            </p>
            <p className="mt-1 text-xs text-rose-200/80">
              {below.map((d) => `${d.short} (${fmtPct(stats[d.id].accuracy)})`).join(' · ')}
            </p>
          </div>
        ) : acc.questions > 0 ? (
          <p className="flex items-center gap-1.5 text-xs text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" /> Todas as disciplinas com questões estão ≥ {threshold}%.
          </p>
        ) : (
          <p className="text-xs text-slate-500">Registre questões para ver o alerta por disciplina.</p>
        )}
        {proj.scaled !== null && (
          <p className="text-[11px] text-slate-500">
            Projeção na objetiva: <span className="text-slate-300">{fmtNum(proj.scaled, 0)}/{OBJECTIVE_MAX}</span> (mínimo do edital: {OBJECTIVE_MIN})
            {!proj.full && ' · baseada só nas disciplinas com questões'}
          </p>
        )}
      </Kpi>
    </section>
  );
}
