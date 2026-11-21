import {
  DISCIPLINES,
  EXAM_BLOCKS,
  OBJECTIVE_MAX,
  PROFILE,
  TOPIC_STAGE_WEIGHTS,
} from '../data/editalData';
import type { AppState, BlockId, Discipline, Simulado, TopicProgress } from '../types';
import { pct } from './utils';

export const EMPTY_TOPIC: TopicProgress = {
  t: false,
  r1: false,
  r2: false,
  questions: 0,
  correct: 0,
  summary: '',
  errors: '',
  links: '',
};

export function topicProgress(p?: TopicProgress): number {
  if (!p) return 0;
  return (p.t ? TOPIC_STAGE_WEIGHTS.t : 0) + (p.r1 ? TOPIC_STAGE_WEIGHTS.r1 : 0) + (p.r2 ? TOPIC_STAGE_WEIGHTS.r2 : 0);
}

export function disciplinePoints(d: Discipline) {
  return d.questions * d.weight;
}

export interface DisciplineStats {
  id: string;
  progress: number; // 0..1
  theoryDone: number;
  r1Done: number;
  r2Done: number;
  topicsTotal: number;
  questions: number;
  correct: number;
  accuracy: number | null;
  minutes: number;
  points: number;
}

/**
 * Questões por disciplina = campos dos tópicos + sessões registradas sem tópico.
 * (Sessões vinculadas a um tópico já somaram seus números no próprio tópico.)
 */
export function disciplineStats(state: AppState, d: Discipline): DisciplineStats {
  let prog = 0;
  let theoryDone = 0;
  let r1Done = 0;
  let r2Done = 0;
  let questions = 0;
  let correct = 0;
  for (const t of d.topics) {
    const p = state.topics[t.id];
    prog += topicProgress(p);
    if (p?.t) theoryDone++;
    if (p?.r1) r1Done++;
    if (p?.r2) r2Done++;
    questions += p?.questions ?? 0;
    correct += p?.correct ?? 0;
  }
  let minutes = 0;
  for (const s of state.sessions) {
    if (s.disciplineId !== d.id) continue;
    minutes += s.minutes;
    if (!s.topicId) {
      questions += s.questions;
      correct += s.correct;
    }
  }
  return {
    id: d.id,
    progress: d.topics.length ? prog / d.topics.length : 0,
    theoryDone,
    r1Done,
    r2Done,
    topicsTotal: d.topics.length,
    questions,
    correct,
    accuracy: pct(correct, questions),
    minutes,
    points: disciplinePoints(d),
  };
}

export function allDisciplineStats(state: AppState): Record<string, DisciplineStats> {
  return Object.fromEntries(DISCIPLINES.map((d) => [d.id, disciplineStats(state, d)]));
}

/** Progresso do edital ponderado pela pontuação máxima de cada disciplina (questões × peso). */
export function weightedProgress(stats: Record<string, DisciplineStats>, block?: BlockId): number {
  let num = 0;
  let den = 0;
  for (const d of DISCIPLINES) {
    if (block && d.block !== block) continue;
    const s = stats[d.id];
    num += s.progress * s.points;
    den += s.points;
  }
  return den ? num / den : 0;
}

export function blockQuestionStats(stats: Record<string, DisciplineStats>, block: BlockId) {
  let q = 0;
  let c = 0;
  for (const d of DISCIPLINES) {
    if (d.block !== block) continue;
    q += stats[d.id].questions;
    c += stats[d.id].correct;
  }
  return { questions: q, correct: c, accuracy: pct(c, q) };
}

/**
 * Projeção de nota na objetiva: aplica o % de acerto de cada disciplina à sua pontuação máxima.
 * Disciplinas sem questões resolvidas ficam de fora (retorna também a cobertura).
 */
export function projectedObjective(stats: Record<string, DisciplineStats>) {
  let points = 0;
  let coveredMax = 0;
  for (const d of DISCIPLINES) {
    const s = stats[d.id];
    if (s.accuracy === null) continue;
    points += (s.accuracy / 100) * s.points;
    coveredMax += s.points;
  }
  return { points, coveredMax, full: coveredMax === OBJECTIVE_MAX, scaled: coveredMax ? (points / coveredMax) * OBJECTIVE_MAX : null };
}

export function totalStudyMinutes(state: AppState) {
  return state.sessions.reduce((a, s) => a + s.minutes, 0);
}

export function overallAccuracy(stats: Record<string, DisciplineStats>) {
  let q = 0;
  let c = 0;
  for (const s of Object.values(stats)) {
    q += s.questions;
    c += s.correct;
  }
  return { questions: q, correct: c, accuracy: pct(c, q) };
}

export function simuladoScores(s: Simulado) {
  const especificos = s.especificosAcertos * 2;
  const objetiva = s.basicos + s.juridicos + especificos;
  const total = objetiva + s.discursiva;
  return { especificos, objetiva, total };
}

export const GOAL_MINUTES = PROFILE.totalHoursGoal * 60;
export { EXAM_BLOCKS };
