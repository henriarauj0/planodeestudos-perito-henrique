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


  return (
    <Modal
      open={open}
      onClose={onMinimize}
      persistent
      title={
        <span className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-ink-muted" /> {timer.label}
        </span>
      }
      description={isPomodoro ? `Pomodoro ${pomodoroFocus}/${pomodoroBreak} · ciclo ${timer.cycles + (timer.phase === 'foco' ? 1 : 0)}` : 'Cronômetro progressivo'}
    >
      {!finishing ? (
        <div className="flex flex-col items-center gap-5">
          <div className="w-full border border-line bg-canvas">
            <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
              <span className="label-caps flex items-center gap-1.5 text-ink">
                <span className={cn('h-1.5 w-1.5', timer.running ? (onBreak ? 'bg-ink-dim' : 'bg-ink') : 'bg-line-strong')} aria-hidden />
                {onBreak ? 'Pausa' : timer.running ? 'Foco · em registro' : 'Pausado'}
              </span>
              <span className="font-mono text-[10px] text-ink-faint">{isPomodoro ? `T-${fmtClock(phaseLimit)}` : 'CRON'}</span>
            </div>
            <div className="px-3 py-6 text-center">
              <div className="num text-6xl font-medium tracking-tight text-ink">{isPomodoro ? fmtClock(remaining) : fmtClock(net)}</div>
              <div className="label-caps mt-2">
                Tempo líquido <span className="num ml-1 text-[11px] tracking-normal text-ink">{fmtClock(net)}</span>
              </div>
            </div>
            {isPomodoro && (
              <div className="relative h-1.5 border-t border-line bg-surface">
                <div className={cn('h-full transition-[width] duration-500', onBreak ? 'bg-ink-dim' : 'bg-ink')} style={{ width: `${ratio * 100}%` }} />
                <div className="pointer-events-none absolute inset-0 flex justify-between" aria-hidden>
                  {Array.from({ length: 11 }, (_, i) => (
                    <span key={i} className="h-full w-px bg-canvas" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {onBreak && (
            <p className="flex items-center gap-1.5 text-xs text-ink-muted">
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
              variant="primary"
              onClick={() => {
                if (timer.running) onPause();
                setFinishing(true);
              }}
            >
              <Flag className="h-4 w-4" /> Finalizar
            </Button>
          </div>

          <div className="flex w-full items-center justify-between border-t border-line pt-3">
            <Button variant="ghost" size="sm" onClick={onMinimize}>
              <Minimize2 className="h-3.5 w-3.5" /> Minimizar
            </Button>
            {confirmDiscard ? (
              <span className="flex items-center gap-2 text-xs text-ink-muted">
                Descartar sem salvar?
                <Button variant="danger" size="sm" onClick={onDiscard}>
                  Sim
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDiscard(false)}>
                  Não
                </Button>
              </span>
            ) : (
              <Button variant="ghost" size="sm" className="text-ink-dim" onClick={() => setConfirmDiscard(true)}>
                <Trash2 className="h-3.5 w-3.5" /> Descartar
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-ink-muted">
            Tempo líquido registrado: <span className="font-semibold font-mono tabular-nums text-ink">{fmtClock(net)}</span>. Ajuste se necessário e informe as questões.
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

/** Indicador fixo quando o cronômetro está minimizado. */
export function TimerPill({ timer, now, onOpen }: { timer: ActiveTimer; now: number; onOpen: () => void }) {
  const onBreak = timer.mode === 'pomodoro' && timer.phase === 'pausa';
  return (
    <button
      onClick={onOpen}
      className="fixed bottom-4 right-4 z-40 flex items-center gap-3 rounded-md border border-line-strong bg-surface-2 py-2 pl-3 pr-4 hover:border-ink-dim"
    >
      <span className={cn('h-2 w-2', timer.running ? (onBreak ? 'bg-ink-dim' : 'bg-ink') : 'bg-line-strong')} aria-hidden />
      <span className="label-caps hidden sm:inline">{onBreak ? 'Pausa' : timer.running ? 'Em registro' : 'Pausado'}</span>
      <span className="max-w-[10rem] truncate text-xs text-ink-muted">{timer.label}</span>
      <span className="num text-sm text-ink">{fmtClock(netElapsed(timer, now))}</span>
    </button>
  );
}
