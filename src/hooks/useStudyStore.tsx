import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ALL_TOPICS } from '../data/editalData';
import { EMPTY_TOPIC } from '../lib/metrics';
import { toISODate } from '../lib/dates';
import { toInt, uid } from '../lib/utils';
import type {
  AppState,
  DiscursivaProgress,
  Settings,
  Simulado,
  StudySession,
  TopicProgress,
} from '../types';

export const STORAGE_KEY = 'pcac-perito-dashboard:v1';
export const BACKUP_APP_ID = 'pcac-perito-dashboard';

const DEFAULT_SETTINGS: Settings = {
  alertThreshold: 60,
  pomodoroFocus: 50,
  pomodoroBreak: 10,
  soundOn: true,
};

export function createInitialState(): AppState {
  return {
    version: 1,
    topics: Object.fromEntries(ALL_TOPICS.map((t) => [t.id, { ...EMPTY_TOPIC }])),
    sessions: [],
    simulados: [],
    discursivas: {},
    customThemes: [],
    settings: { ...DEFAULT_SETTINGS },
  };
}

/** Mescla dados carregados (localStorage ou backup) com o estado padrão, tolerando campos ausentes. */
export function normalizeState(raw: unknown): AppState {
  const base = createInitialState();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<AppState>;
  const topics: Record<string, TopicProgress> = { ...base.topics };
  if (r.topics && typeof r.topics === 'object') {
    for (const [id, p] of Object.entries(r.topics)) {
      if (!p || typeof p !== 'object') continue;
      const q = toInt((p as TopicProgress).questions);
      topics[id] = {
        ...EMPTY_TOPIC,
        ...p,
        t: !!p.t,
        r1: !!p.r1,
        r2: !!p.r2,
        questions: q,
        correct: Math.min(q, toInt((p as TopicProgress).correct)),
        summary: String(p.summary ?? ''),
        errors: String(p.errors ?? ''),
        links: String(p.links ?? ''),
      };
    }
  }
  return {
    version: 1,
    topics,
    sessions: Array.isArray(r.sessions) ? r.sessions.filter((s) => s && s.id && s.disciplineId) : [],
    simulados: Array.isArray(r.simulados) ? r.simulados.filter((s) => s && s.id) : [],
    discursivas: r.discursivas && typeof r.discursivas === 'object' ? r.discursivas : {},
    customThemes: Array.isArray(r.customThemes) ? r.customThemes : [],
    settings: { ...DEFAULT_SETTINGS, ...(r.settings ?? {}) },
  };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeState(JSON.parse(raw));
  } catch {
    /* localStorage indisponível ou corrompido: começa do zero */
  }
  return createInitialState();
}

type Stage = 't' | 'r1' | 'r2';

interface StoreApi {
  state: AppState;
  storageOk: boolean;
  lastSavedAt: number | null;
  toggleStage: (topicId: string, stage: Stage) => void;
  setTopicQuestions: (topicId: string, questions: number, correct: number) => void;
  setTopicNotes: (topicId: string, notes: Pick<TopicProgress, 'summary' | 'errors' | 'links'>) => void;
  addSession: (s: Omit<StudySession, 'id'>) => void;
  deleteSession: (id: string) => void;
  upsertSimulado: (s: Simulado) => void;
  deleteSimulado: (id: string) => void;
  setDiscursiva: (themeId: string, patch: Partial<DiscursivaProgress>) => void;
  logDiscursiva: (themeId: string, score?: number) => void;
  addCustomTheme: (title: string) => void;
  removeCustomTheme: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  replaceState: (s: AppState) => void;
  resetState: () => void;
}

const StoreContext = createContext<StoreApi | null>(null);

export function StudyStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);
  const [storageOk, setStorageOk] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const first = useRef(true);

  // Persistência automática (com pequeno debounce para digitação).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const h = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        setStorageOk(true);
        setLastSavedAt(Date.now());
      } catch {
        setStorageOk(false);
      }
    }, 250);
    return () => window.clearTimeout(h);
  }, [state]);

  const patchTopic = useCallback((topicId: string, fn: (p: TopicProgress) => TopicProgress) => {
    setState((s) => ({
      ...s,
      topics: { ...s.topics, [topicId]: fn(s.topics[topicId] ?? { ...EMPTY_TOPIC }) },
    }));
  }, []);

  const api = useMemo<StoreApi>(
    () => ({
      state,
      storageOk,
      lastSavedAt,
      toggleStage: (topicId, stage) => patchTopic(topicId, (p) => ({ ...p, [stage]: !p[stage] })),
      setTopicQuestions: (topicId, questions, correct) =>
        patchTopic(topicId, (p) => {
          const q = toInt(questions);
          return { ...p, questions: q, correct: Math.min(q, toInt(correct)) };
        }),
      setTopicNotes: (topicId, notes) => patchTopic(topicId, (p) => ({ ...p, ...notes })),
      addSession: (input) =>
        setState((s) => {
          const session: StudySession = { ...input, id: uid('ses') };
          let topics = s.topics;
          if (session.topicId && (session.questions || session.correct)) {
            const p = topics[session.topicId] ?? { ...EMPTY_TOPIC };
            const q = p.questions + session.questions;
            topics = { ...topics, [session.topicId]: { ...p, questions: q, correct: Math.min(q, p.correct + session.correct) } };
          }
          return { ...s, topics, sessions: [session, ...s.sessions] };
        }),
      deleteSession: (id) =>
        setState((s) => {
          const session = s.sessions.find((x) => x.id === id);
          if (!session) return s;
          let topics = s.topics;
          if (session.topicId && topics[session.topicId]) {
            const p = topics[session.topicId];
            const q = Math.max(0, p.questions - session.questions);
            topics = {
              ...topics,
              [session.topicId]: { ...p, questions: q, correct: Math.min(q, Math.max(0, p.correct - session.correct)) },
            };
          }
          return { ...s, topics, sessions: s.sessions.filter((x) => x.id !== id) };
        }),
      upsertSimulado: (sim) =>
        setState((s) => {
          const exists = s.simulados.some((x) => x.id === sim.id);
          const simulados = exists ? s.simulados.map((x) => (x.id === sim.id ? sim : x)) : [...s.simulados, sim];
          simulados.sort((a, b) => a.date.localeCompare(b.date));
          return { ...s, simulados };
        }),
      deleteSimulado: (id) => setState((s) => ({ ...s, simulados: s.simulados.filter((x) => x.id !== id) })),
      setDiscursiva: (themeId, patch) =>
        setState((s) => {
          const cur = s.discursivas[themeId] ?? { done: false, count: 0 };
          return { ...s, discursivas: { ...s.discursivas, [themeId]: { ...cur, ...patch } } };
        }),
      logDiscursiva: (themeId, score) =>
        setState((s) => {
          const cur = s.discursivas[themeId] ?? { done: false, count: 0 };
          const best = score === undefined ? cur.bestScore : Math.max(cur.bestScore ?? 0, score);
          return {
            ...s,
            discursivas: {
              ...s.discursivas,
              [themeId]: { done: true, count: cur.count + 1, lastDate: toISODate(new Date()), bestScore: best },
            },
          };
        }),
      addCustomTheme: (title) =>
        setState((s) => ({ ...s, customThemes: [...s.customThemes, { id: uid('dtc'), title, custom: true }] })),
      removeCustomTheme: (id) =>
        setState((s) => {
          const { [id]: _removed, ...rest } = s.discursivas;
          void _removed;
          return { ...s, customThemes: s.customThemes.filter((t) => t.id !== id), discursivas: rest };
        }),
      updateSettings: (patch) => setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })),
      replaceState: (next) => setState(normalizeState(next)),
      resetState: () => setState(createInitialState()),
    }),
    [state, storageOk, lastSavedAt, patchTopic],
  );

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStudyStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStudyStore deve ser usado dentro de <StudyStoreProvider>');
  return ctx;
}

// ---------------- Backup ----------------

export function buildBackup(state: AppState) {
  return {
    app: BACKUP_APP_ID,
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    state,
  };
}

export function parseBackup(text: string): AppState {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('O arquivo não é um JSON válido.');
  }
  if (!data || typeof data !== 'object') throw new Error('Conteúdo do backup inválido.');
  const d = data as { app?: string; state?: unknown; topics?: unknown };
  if (d.app === BACKUP_APP_ID && d.state) return normalizeState(d.state);
  // Aceita também o JSON "cru" do estado.
  if (d.topics) return normalizeState(d);
  throw new Error('Este arquivo não parece ser um backup do Dashboard do Concurseiro.');
}
