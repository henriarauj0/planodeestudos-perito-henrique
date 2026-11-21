import { useCallback, useEffect, useRef, useState } from 'react';
import type { ActiveTimer } from '../types';

const TIMER_KEY = 'pcac-perito-dashboard:timer';

function load(): ActiveTimer | null {
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    return raw ? (JSON.parse(raw) as ActiveTimer) : null;
  } catch {
    return null;
  }
}

function save(t: ActiveTimer | null) {
  try {
    if (t) localStorage.setItem(TIMER_KEY, JSON.stringify(t));
    else localStorage.removeItem(TIMER_KEY);
  } catch {
    /* ignora: o cronômetro continua funcionando em memória */
  }
}

export function phaseElapsed(t: ActiveTimer, now: number) {
  return t.phaseElapsedMs + (t.running && t.phaseStartedAt ? now - t.phaseStartedAt : 0);
}

/** Tempo líquido de estudo (só fases de foco contam). */
export function netElapsed(t: ActiveTimer, now: number) {
  return t.focusMs + (t.phase === 'foco' ? phaseElapsed(t, now) : 0);
}

let audioCtx: AudioContext | null = null;
export function beep(times = 2) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = audioCtx ?? new Ctx();
    const ctx = audioCtx;
    for (let i = 0; i < times; i++) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      o.type = 'sine';
      const t0 = ctx.currentTime + i * 0.35;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);
      o.connect(g).connect(ctx.destination);
      o.start(t0);
      o.stop(t0 + 0.3);
    }
  } catch {
    /* sem áudio disponível */
  }
}

interface Options {
  focusMin: number;
  breakMin: number;
  soundOn: boolean;
}

export function useActiveTimer({ focusMin, breakMin, soundOn }: Options) {
  const [timer, setTimerState] = useState<ActiveTimer | null>(load);
  const [now, setNow] = useState(() => Date.now());
  const soundRef = useRef(soundOn);
  soundRef.current = soundOn;

  const setTimer = useCallback((next: ActiveTimer | null | ((t: ActiveTimer | null) => ActiveTimer | null)) => {
    setTimerState((cur) => {
      const value = typeof next === 'function' ? next(cur) : next;
      save(value);
      return value;
    });
  }, []);

  // Relógio + troca automática de fase no Pomodoro.
  useEffect(() => {
    if (!timer?.running) return;
    const id = window.setInterval(() => {
      const n = Date.now();
      setNow(n);
      setTimer((t) => {
        if (!t || !t.running || t.mode !== 'pomodoro') return t;
        const limit = (t.phase === 'foco' ? focusMin : breakMin) * 60_000;
        const el = phaseElapsed(t, n);
        if (el < limit) return t;
        const overflow = el - limit;
        if (soundRef.current) beep(t.phase === 'foco' ? 2 : 3);
        if (t.phase === 'foco') {
          return { ...t, phase: 'pausa', focusMs: t.focusMs + limit, cycles: t.cycles + 1, phaseElapsedMs: 0, phaseStartedAt: n - overflow };
        }
        return { ...t, phase: 'foco', phaseElapsedMs: 0, phaseStartedAt: n - overflow };
      });
    }, 500);
    return () => window.clearInterval(id);
  }, [timer?.running, focusMin, breakMin, setTimer]);

  const start = useCallback(
    (init: Pick<ActiveTimer, 'blockId' | 'label' | 'disciplineIds' | 'mode'>) => {
      const n = Date.now();
      setNow(n);
      setTimer({
        ...init,
        running: true,
        phase: 'foco',
        phaseStartedAt: n,
        phaseElapsedMs: 0,
        focusMs: 0,
        cycles: 0,
        createdAt: n,
      });
    },
    [setTimer],
  );

  const pause = useCallback(() => {
    const n = Date.now();
    setNow(n);
    setTimer((t) => (t && t.running ? { ...t, running: false, phaseElapsedMs: phaseElapsed(t, n), phaseStartedAt: null } : t));
  }, [setTimer]);

  const resume = useCallback(() => {
    const n = Date.now();
    setNow(n);
    setTimer((t) => (t && !t.running ? { ...t, running: true, phaseStartedAt: n } : t));
  }, [setTimer]);

  /** Pula a pausa do Pomodoro e volta ao foco. */
  const skipBreak = useCallback(() => {
    const n = Date.now();
    setTimer((t) => (t && t.phase === 'pausa' ? { ...t, phase: 'foco', phaseElapsedMs: 0, phaseStartedAt: t.running ? n : null } : t));
  }, [setTimer]);

  const clear = useCallback(() => setTimer(null), [setTimer]);

  return { timer, now, start, pause, resume, skipBreak, clear };
}
