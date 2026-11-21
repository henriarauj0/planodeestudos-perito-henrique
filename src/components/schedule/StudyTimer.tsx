import { useState } from 'react';
import { Coffee, Flag, Minimize2, Pause, Play, SkipForward, Timer, Trash2 } from 'lucide-react';
import type { ActiveTimer } from '../../types';
import { netElapsed, phaseElapsed } from '../../hooks/useActiveTimer';
import { useStudyStore } from '../../hooks/useStudyStore';
import { cn, fmtClock } from '../../lib/utils';
import { Button } from '../ui/button';
import { Modal } from '../ui/dialog';
import { useToast } from '../ui/toast';
import { SessionForm } from './SessionForm';

interface Props {
  open: boolean;
  timer: ActiveTimer;
  now: number;
  onMinimize: () => void;
  onPause: () => void;
  onResume: () => void;
  onSkipBreak: () => void;
  onDiscard: () => void;
  onFinished: () => void;
}

export function StudyTimer({ open, timer, now, onMinimize, onPause, onResume, onSkipBreak, onDiscard, onFinished }: Props) {
  const { state } = useStudyStore();
  const toast = useToast();
  const [finishing, setFinishing] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const { pomodoroFocus, pomodoroBreak } = state.settings;

  const net = netElapsed(timer, now);
  const phaseMs = phaseElapsed(timer, now);
  const isPomodoro = timer.mode === 'pomodoro';
  const phaseLimit = (timer.phase === 'foco' ? pomodoroFocus : pomodoroBreak) * 60_000;
  const remaining = Math.max(0, phaseLimit - phaseMs);
  const ratio = isPomodoro ? Math.min(1, phaseMs / phaseLimit) : 0;
  const onBreak = isPomodoro && timer.phase === 'pausa';

  const R = 88;
  const C = 2 * Math.PI * R;

  return (
    <Modal
      open={open}
      onClose={onMinimize}
      persistent
      title={
        <span className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-cyan-300" /> {timer.label}
        </span>
      }
      description={isPomodoro ? `Pomodoro ${pomodoroFocus}/${pomodoroBreak} · ciclo ${timer.cycles + (timer.phase === 'foco' ? 1 : 0)}` : 'Cronômetro progressivo'}
    >
      {!finishing ? (
        <div className="flex flex-col items-center gap-5">
          <div className="relative grid h-56 w-56 place-items-center">
            <svg viewBox="0 0 200 200" className="absolute inset-0 -rotate-90" aria-hidden>
              <circle cx="100" cy="100" r={R} className="fill-none stroke-slate-800" strokeWidth="6" />
              {isPomodoro && (
                <circle
                  cx="100"
                  cy="100"
                  r={R}
                  className={cn('fill-none transition-[stroke-dashoffset] duration-500', onBreak ? 'stroke-violet-400' : 'stroke-cyan-400')}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - ratio)}
                />
              )}
              {!isPomodoro && timer.running && (
                <circle cx="100" cy="100" r={R} className="fill-none stroke-cyan-400/60" strokeWidth="6" strokeDasharray="4 10" />
              )}
            </svg>
            <div className="text-center">
              <div className={cn('mb-1 text-[11px] font-medium uppercase tracking-widest', onBreak ? 'text-violet-300' : 'text-cyan-300')}>
                {onBreak ? 'Pausa' : timer.running ? 'Foco' : 'Pausado'}
              </div>
              <div className="text-5xl font-semibold tabular-nums text-slate-50">{isPomodoro ? fmtClock(remaining) : fmtClock(net)}</div>
              <div className="mt-1 text-xs text-slate-400">
                Líquido: <span className="tabular-nums text-slate-200">{fmtClock(net)}</span>
              </div>
            </div>
          </div>

          {onBreak && (
            <p className="flex items-center gap-1.5 text-xs text-violet-200">
              <Coffee className="h-3.5 w-3.5" /> Intervalo não conta como tempo líquido.
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-2">
            {timer.running ? (
              <Button variant="secondary" size="lg" onClick={onPause}>
                <Pause className="h-4 w-4" /> Pausar
              </Button>
            ) : (
              <Button size="lg" onClick={onResume}>
                <Play className="h-4 w-4" /> Retomar
              </Button>
            )}
            {onBreak && (
              <Button variant="outline" size="lg" onClick={onSkipBreak}>
                <SkipForward className="h-4 w-4" /> Pular pausa
              </Button>
            )}
            <Button
              size="lg"
              className="bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              onClick={() => {
                if (timer.running) onPause();
                setFinishing(true);
              }}
            >
              <Flag className="h-4 w-4" /> Finalizar
            </Button>
          </div>

          <div className="flex w-full items-center justify-between border-t border-slate-800 pt-3">
            <Button variant="ghost" size="sm" onClick={onMinimize}>
              <Minimize2 className="h-3.5 w-3.5" /> Minimizar
            </Button>
            {confirmDiscard ? (
              <span className="flex items-center gap-2 text-xs text-slate-400">
                Descartar sem salvar?
                <Button variant="danger" size="sm" onClick={onDiscard}>
                  Sim
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDiscard(false)}>
                  Não
                </Button>
              </span>
            ) : (
              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-rose-300" onClick={() => setConfirmDiscard(true)}>
                <Trash2 className="h-3.5 w-3.5" /> Descartar
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-300">
            Tempo líquido registrado: <span className="font-semibold tabular-nums text-cyan-300">{fmtClock(net)}</span>. Ajuste se necessário e informe as questões.
          </p>
          <SessionForm
            blockId={timer.blockId}
            disciplineIds={timer.disciplineIds}
            defaultMinutes={net / 60_000}
            mode={timer.mode}
            onCancel={() => setFinishing(false)}
            onSaved={() => {
              setFinishing(false);
              toast('Sessão registrada e somada às métricas.');
              onFinished();
            }}
          />
        </div>
      )}
    </Modal>
  );
}

/** Indicador flutuante quando o cronômetro está minimizado. */
export function TimerPill({ timer, now, onOpen }: { timer: ActiveTimer; now: number; onOpen: () => void }) {
  const onBreak = timer.mode === 'pomodoro' && timer.phase === 'pausa';
  return (
    <button
      onClick={onOpen}
      className={cn(
        'fixed bottom-4 right-4 z-40 flex items-center gap-3 rounded-full border bg-slate-900/95 py-2 pl-3 pr-4 shadow-2xl backdrop-blur',
        onBreak ? 'border-violet-500/40' : 'border-cyan-500/40',
      )}
    >
      <span className="relative flex h-2.5 w-2.5">
        {timer.running && <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', onBreak ? 'bg-violet-400' : 'bg-cyan-400')} />}
        <span className={cn('relative inline-flex h-2.5 w-2.5 rounded-full', timer.running ? (onBreak ? 'bg-violet-400' : 'bg-cyan-400') : 'bg-slate-500')} />
      </span>
      <span className="max-w-[10rem] truncate text-xs text-slate-300">{timer.label}</span>
      <span className="text-sm font-semibold tabular-nums text-slate-50">{fmtClock(netElapsed(timer, now))}</span>
    </button>
  );
}
