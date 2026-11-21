// Tipos centrais da aplicação.

export type BlockId = 'especificos' | 'basicos' | 'juridicos';

/** Origem do tópico: listado pelo aluno ou acrescentado a partir do Anexo III do edital. */
export type TopicOrigin = 'aluno' | 'edital';

export interface Topic {
  id: string;
  title: string;
  /** Referência ao item do Anexo III (ex.: "Item 6"). */
  ref?: string;
  origin: TopicOrigin;
}

export interface Discipline {
  id: string;
  name: string;
  short: string;
  block: BlockId;
  /** Nº de questões na prova objetiva (item 10.4, II do edital). */
  questions: number;
  weight: number;
  /** true quando a divisão de questões é estimativa (o edital não a fixa). */
  estimated?: boolean;
  /** Prioridade no plano, conforme o perfil do aluno. */
  priority: 'alta' | 'media' | 'baixa' | 'revisao';
  /** Código curto exibido em etiqueta (ex.: "ÁREA 04 · TI"). */
  tag: string;
  topics: Topic[];
}

export interface ExamBlock {
  id: BlockId;
  name: string;
  questions: number;
  weight: number;
  maxPoints: number;
  /** Pontuação mínima exigida pelo edital (subitem 10.5). */
  minRule: string;
}

/** Disciplina "virtual" usada apenas para contabilizar horas (ex.: treino de discursiva). */
export interface ExtraTrack {
  id: string;
  name: string;
  short: string;
}

export interface ScheduleBlock {
  id: string;
  label: string;
  minutes: number;
  /** Disciplinas que podem receber o tempo deste bloco (a primeira é o padrão). */
  disciplineIds: string[];
  kind?: 'estudo' | 'revisao' | 'questoes' | 'discursiva';
  /** Divisão planejada dos minutos entre disciplinas (padrão: tudo na primeira). */
  allocation?: Record<string, number>;
}

export interface ScheduleDay {
  /** 0 = domingo ... 6 = sábado (Date.getDay()). */
  weekday: number;
  name: string;
  short: string;
  blocks: ScheduleBlock[];
  note?: string;
}

export interface DiscursivaTheme {
  id: string;
  title: string;
  hint?: string;
  custom?: boolean;
}

// ---------- Estado persistido ----------

export interface TopicProgress {
  t: boolean;
  r1: boolean;
  r2: boolean;
  questions: number;
  correct: number;
  summary: string;
  errors: string;
  links: string;
}

export interface StudySession {
  id: string;
  /** ISO datetime do término. */
  date: string;
  blockId?: string;
  disciplineId: string;
  topicId?: string;
  minutes: number;
  questions: number;
  correct: number;
  mode: 'cronometro' | 'pomodoro' | 'manual';
}

export interface Simulado {
  id: string;
  date: string; // yyyy-mm-dd
  name: string;
  basicos: number; // 0-24 (acertos = pontos, peso 1)
  juridicos: number; // 0-16
  especificosAcertos: number; // 0-60 (x2 = pontos)
  discursiva: number; // 0-40
  notes?: string;
}

export interface DiscursivaProgress {
  done: boolean;
  count: number;
  lastDate?: string;
  bestScore?: number;
}

export interface Settings {
  alertThreshold: number;
  pomodoroFocus: number;
  pomodoroBreak: number;
  soundOn: boolean;
}

export interface AppState {
  version: 1;
  topics: Record<string, TopicProgress>;
  sessions: StudySession[];
  simulados: Simulado[];
  discursivas: Record<string, DiscursivaProgress>;
  customThemes: DiscursivaTheme[];
  settings: Settings;
}

export interface ActiveTimer {
  blockId: string;
  label: string;
  disciplineIds: string[];
  mode: 'cronometro' | 'pomodoro';
  running: boolean;
  phase: 'foco' | 'pausa';
  /** Início do trecho em andamento da fase atual (null se pausado). */
  phaseStartedAt: number | null;
  /** Tempo já decorrido na fase atual antes do trecho em andamento. */
  phaseElapsedMs: number;
  /** Tempo líquido de foco de fases anteriores já concluídas. */
  focusMs: number;
  cycles: number;
  createdAt: number;
}
