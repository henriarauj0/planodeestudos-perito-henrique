import { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Flag, PenLine, Play, Plus, Trash2, Volume2, VolumeX } from 'lucide-react';
import { PROFILE, SIMULADO_SUNDAYS, WEEKLY_SCHEDULE, trackBlock, trackName } from '../../data/editalData';
import { useStudyStore } from '../../hooks/useStudyStore';
import { useNow } from '../../hooks/useNow';
import { currentWeekIndex, fmtDate, parseISODate, planWeeks, toISODate } from '../../lib/dates';
import { TONE } from '../../lib/theme';
import { ACCURACY_CLASSES, accuracyTone, cn, fmtHours, fmtPct, pct, toInt } from '../../lib/utils';
import type { ActiveTimer, ScheduleBlock } from '../../types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Modal } from '../ui/dialog';
import { Input } from '../ui/input';
import { useToast } from '../ui/toast';
import { AllocationCard } from './AllocationCard';
import { SessionForm } from './SessionForm';

interface Props {
  timer: ActiveTimer | null;
  onStart: (block: ScheduleBlock, mode: ActiveTimer['mode']) => void;
  onOpenTimer: () => void;
}

export function WeeklySchedule({ timer, onStart, onOpenTimer }: Props) {
  const { state, updateSettings, deleteSession } = useStudyStore();
  const toast = useToast();
  const now = useNow(60_000);
  const weeks = useMemo(() => planWeeks(), []);
  const [weekIdx, setWeekIdx] = useState(() => currentWeekIndex());
  const [mode, setMode] = useState<ActiveTimer['mode']>('pomodoro');
  const [manual, setManual] = useState<{ block: ScheduleBlock; date: string } | null>(null);
  const [showAll, setShowAll] = useState(false);

  const week = weeks[weekIdx - 1];
  const todayISO = toISODate(now);
  const start = parseISODate(PROFILE.startDate);
  const exam = parseISODate(PROFILE.examDate);

  // minutos registrados por bloco+data
  const logged = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of state.sessions) {
      if (!s.blockId) continue;
      const key = `${s.blockId}|${toISODate(new Date(s.date))}`;
      map.set(key, (map.get(key) ?? 0) + s.minutes);
    }
    return map;
  }, [state.sessions]);

  const weekMinutes = useMemo(() => {
    const from = toISODate(week.monday);
    const to = toISODate(week.sunday);
    return state.sessions.reduce((a, s) => {
      const d = toISODate(new Date(s.date));
      return d >= from && d <= to ? a + s.minutes : a;
    }, 0);
  }, [state.sessions, week]);

  const weekPlanned = week.days.reduce((a, d) => {
    if (d < start || d >= exam) return a;
    const day = WEEKLY_SCHEDULE.find((x) => x.weekday === d.getDay());
    return a + (day?.blocks.reduce((b, x) => b + x.minutes, 0) ?? 0);
  }, 0);

  const sessions = showAll ? state.sessions : state.sessions.slice(0, 12);

  return (
    <div className="space-y-4">
      {/* Barra de controle */}
      <Card className="flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setWeekIdx((i) => Math.max(1, i - 1))} disabled={weekIdx === 1} aria-label="Semana anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[12rem] text-center">
            <div className="text-sm font-semibold text-slate-100">
              Semana {weekIdx} de {weeks.length}
            </div>
            <div className="text-xs text-slate-400">
              {fmtDate(week.monday)} a {fmtDate(week.sunday)} · {fmtHours(weekMinutes)} de {fmtHours(weekPlanned)}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekIdx((i) => Math.min(weeks.length, i + 1))}
            disabled={weekIdx === weeks.length}
            aria-label="Próxima semana"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {weekIdx !== currentWeekIndex() && (
            <Button variant="outline" size="sm" onClick={() => setWeekIdx(currentWeekIndex())}>
              Hoje
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-slate-950/60 p-0.5 ring-1 ring-slate-800" role="radiogroup" aria-label="Modo do timer">
            {(['pomodoro', 'cronometro'] as const).map((m) => (
              <button
                key={m}
                role="radio"
                aria-checked={mode === m}
                onClick={() => setMode(m)}
                className={cn('rounded-md px-3 py-1.5 text-xs font-medium', mode === m ? 'bg-slate-800 text-slate-50' : 'text-slate-400 hover:text-slate-200')}
              >
                {m === 'pomodoro' ? `Pomodoro ${state.settings.pomodoroFocus}/${state.settings.pomodoroBreak}` : 'Cronômetro'}
              </button>
            ))}
          </div>
          {mode === 'pomodoro' && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Input
                aria-label="Minutos de foco"
                type="number"
                min={5}
                className="h-8 w-14 px-2 text-xs"
                value={state.settings.pomodoroFocus}
                onChange={(e) => updateSettings({ pomodoroFocus: Math.max(5, toInt(e.target.value, 180)) })}
              />
              /
              <Input
                aria-label="Minutos de pausa"
                type="number"
                min={1}
                className="h-8 w-14 px-2 text-xs"
                value={state.settings.pomodoroBreak}
                onChange={(e) => updateSettings({ pomodoroBreak: Math.max(1, toInt(e.target.value, 60)) })}
              />
              min
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => updateSettings({ soundOn: !state.settings.soundOn })}
            aria-label={state.settings.soundOn ? 'Desativar som' : 'Ativar som'}
            title={state.settings.soundOn ? 'Som do Pomodoro ativado' : 'Som do Pomodoro desativado'}
          >
            {state.settings.soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>
      </Card>

      {/* Grade semanal */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
        {week.days.map((d) => {
          const iso = toISODate(d);
          const def = WEEKLY_SCHEDULE.find((x) => x.weekday === d.getDay())!;
          const isToday = iso === todayISO;
          const outOfPlan = d < start;
          const isExam = iso === PROFILE.examDate;
          const isSimulado = SIMULADO_SUNDAYS.includes(iso);
          const dayLogged = def.blocks.reduce((a, b) => a + (logged.get(`${b.id}|${iso}`) ?? 0), 0);
          const dayPlanned = def.blocks.reduce((a, b) => a + b.minutes, 0);
          return (
            <Card
              key={iso}
              className={cn(
                'flex flex-col p-3',
                isToday && 'border-cyan-500/60 ring-1 ring-cyan-500/30',
                outOfPlan && 'opacity-45',
                isExam && 'border-rose-500/50 bg-rose-500/5',
              )}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-slate-100">{def.name}</div>
                  <div className="text-xs text-slate-500">{fmtDate(d, { day: '2-digit', month: 'short' })}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {isToday && <Badge className="bg-cyan-500/15 text-cyan-200 ring-cyan-500/40">Hoje</Badge>}
                  {dayPlanned > 0 && (
                    <span className="text-[11px] tabular-nums text-slate-500">
                      {fmtHours(dayLogged)}/{fmtHours(dayPlanned)}
                    </span>
                  )}
                </div>
              </div>

              {outOfPlan && <p className="text-xs text-slate-500">Antes do início do plano (24/11).</p>}

              {!outOfPlan && def.blocks.length === 0 && (
                <div className="flex flex-1 flex-col gap-2">
                  {isExam ? (
                    <div className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-200 ring-1 ring-rose-500/30">
                      <Flag className="mb-1 h-4 w-4" />
                      <strong>Dia da prova.</strong> Portões: 06h00 às 07h00. Prova: 07h00 às 12h00 (horário do Acre).
                    </div>
                  ) : isSimulado ? (
                    <>
                      <div className="rounded-lg bg-violet-500/10 p-3 text-xs text-violet-200 ring-1 ring-violet-500/30">
                        <strong className="block text-sm">Simulado quinzenal</strong>
                        07h00 às 12h00, no horário oficial da prova. Registre a nota na aba Simulados.
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={!!timer}
                        onClick={() => onStart({ id: `dom-sim`, label: 'Simulado (5h)', minutes: 300, disciplineIds: ['simulado'] }, 'cronometro')}
                      >
                        <Play className="h-3.5 w-3.5" /> Cronometrar simulado
                      </Button>
                    </>
                  ) : (
                    <p className="rounded-lg bg-slate-950/50 p-3 text-xs text-slate-400 ring-1 ring-slate-800">{def.note}</p>
                  )}
                </div>
              )}

              {!outOfPlan && (
                <div className="flex flex-col gap-2">
                  {def.blocks.map((b) => {
                    const tone = TONE[trackBlock(b.disciplineIds[0])];
                    const done = logged.get(`${b.id}|${iso}`) ?? 0;
                    const complete = done >= b.minutes * 0.9;
                    const running = timer?.blockId === b.id;
                    return (
                      <div key={b.id} className={cn('rounded-lg border-l-2 bg-slate-950/50 p-2.5 ring-1 ring-slate-800', tone.border)}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-[13px] font-medium leading-snug text-slate-100">{b.label}</div>
                            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                              <Clock3 className="h-3 w-3" /> {fmtHours(b.minutes)}
                              {done > 0 && <span className={cn('ml-1', complete ? 'text-emerald-300' : 'text-slate-300')}>· feito {fmtHours(done)}</span>}
                            </div>
                          </div>
                          {complete && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-label="Bloco concluído" />}
                        </div>
                        <div className="mt-2 flex gap-1.5">
                          {running ? (
                            <Button size="sm" className="flex-1" onClick={onOpenTimer}>
                              <Clock3 className="h-3.5 w-3.5" /> Em andamento
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="flex-1"
                              disabled={!!timer}
                              title={timer ? 'Finalize o cronômetro em andamento primeiro' : 'Iniciar estudo'}
                              onClick={() => onStart(b, mode)}
                            >
                              <Play className="h-3.5 w-3.5" /> Iniciar estudo
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" title="Registrar manualmente" aria-label="Registrar manualmente" onClick={() => setManual({ block: b, date: iso })}>
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        {/* Sessões */}
        <Card className="xl:col-span-3">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-cyan-300" /> Sessões registradas
              </CardTitle>
              <CardDescription>{state.sessions.length} sessões · {fmtHours(state.sessions.reduce((a, s) => a + s.minutes, 0))} líquidas</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setManual({ block: { id: '', label: 'Registro avulso', minutes: 60, disciplineIds: [] }, date: todayISO })}>
              <PenLine className="h-3.5 w-3.5" /> Registro avulso
            </Button>
          </CardHeader>
          <CardContent>
            {state.sessions.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-800 p-6 text-center text-sm text-slate-500">
                Nenhuma sessão ainda. Clique em <strong className="text-slate-300">Iniciar estudo</strong> em um bloco da grade.
              </p>
            ) : (
              <div className="-mx-1 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="text-[11px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-1 py-2 font-medium">Data</th>
                      <th className="px-1 py-2 font-medium">Disciplina</th>
                      <th className="px-1 py-2 text-right font-medium">Tempo</th>
                      <th className="px-1 py-2 text-right font-medium">Questões</th>
                      <th className="px-1 py-2 text-right font-medium">Acerto</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {sessions.map((s) => {
                      const a = pct(s.correct, s.questions);
                      const tone = TONE[trackBlock(s.disciplineId)];
                      return (
                        <tr key={s.id} className="text-slate-300">
                          <td className="whitespace-nowrap px-1 py-2 tabular-nums text-slate-400">{fmtDate(s.date, { day: '2-digit', month: '2-digit' })}</td>
                          <td className="px-1 py-2">
                            <span className="flex items-center gap-2">
                              <span className={cn('h-2 w-2 shrink-0 rounded-full', tone.dot)} />
                              {trackName(s.disciplineId, true)}
                              {s.topicId && <Badge className="text-[10px]">tópico</Badge>}
                            </span>
                          </td>
                          <td className="px-1 py-2 text-right tabular-nums">{fmtHours(s.minutes)}</td>
                          <td className="px-1 py-2 text-right tabular-nums">{s.questions ? `${s.correct}/${s.questions}` : '—'}</td>
                          <td className="px-1 py-2 text-right">
                            <span className={cn('rounded px-1.5 py-0.5 text-xs ring-1', ACCURACY_CLASSES[accuracyTone(a)])}>{fmtPct(a)}</span>
                          </td>
                          <td className="px-1 py-2 text-right">
                            <button
                              className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-rose-300"
                              aria-label="Excluir sessão"
                              onClick={() => {
                                deleteSession(s.id);
                                toast('Sessão excluída.', 'info');
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {state.sessions.length > 12 && (
                  <button className="mt-2 text-xs text-cyan-300 hover:underline" onClick={() => setShowAll((v) => !v)}>
                    {showAll ? 'Mostrar menos' : `Ver todas (${state.sessions.length})`}
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <AllocationCard className="xl:col-span-2" />
      </div>

      <Modal
        open={!!manual}
        onClose={() => setManual(null)}
        title={manual?.block.id ? `Registrar: ${manual.block.label}` : 'Registro avulso de estudo'}
        description="Use para lançar estudo feito fora do cronômetro."
      >
        {manual && (
          <SessionForm
            blockId={manual.block.id || undefined}
            disciplineIds={manual.block.disciplineIds}
            defaultMinutes={manual.block.minutes}
            defaultDate={manual.date}
            mode="manual"
            onCancel={() => setManual(null)}
            onSaved={() => {
              setManual(null);
              toast('Sessão registrada.');
            }}
          />
        )}
      </Modal>
    </div>
  );
}
