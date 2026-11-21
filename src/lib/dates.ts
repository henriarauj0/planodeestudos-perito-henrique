import { PROFILE, WEEKLY_SCHEDULE } from '../data/editalData';

/** yyyy-mm-dd no fuso local do navegador. */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Cria Date local (meia-noite) a partir de yyyy-mm-dd. */
export function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function fmtDate(s: string | Date, opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit' }) {
  const d = typeof s === 'string' ? (s.length === 10 ? parseISODate(s) : new Date(s)) : s;
  return d.toLocaleDateString('pt-BR', opts);
}

/** Segunda-feira da semana que contém a data de início. */
export function planWeekOneMonday(): Date {
  const start = parseISODate(PROFILE.startDate);
  const dow = start.getDay(); // 0 dom
  const diff = dow === 0 ? -6 : 1 - dow;
  return addDays(start, diff);
}

export interface PlanWeek {
  index: number; // 1..9
  monday: Date;
  sunday: Date;
  days: Date[]; // seg..dom
}

export function planWeeks(): PlanWeek[] {
  const first = planWeekOneMonday();
  const exam = parseISODate(PROFILE.examDate);
  const weeks: PlanWeek[] = [];
  for (let i = 0; ; i++) {
    const monday = addDays(first, i * 7);
    if (monday > exam) break;
    const days = Array.from({ length: 7 }, (_, k) => addDays(monday, k));
    weeks.push({ index: i + 1, monday, sunday: days[6], days });
  }
  return weeks;
}

export function currentWeekIndex(now = new Date()): number {
  const weeks = planWeeks();
  const today = parseISODate(toISODate(now));
  if (today < weeks[0].monday) return 1;
  const found = weeks.find((w) => today >= w.monday && today <= w.sunday);
  return found ? found.index : weeks.length;
}

function plannedMinutesForDate(d: Date): number {
  const day = WEEKLY_SCHEDULE.find((s) => s.weekday === d.getDay());
  return day ? day.blocks.reduce((a, b) => a + b.minutes, 0) : 0;
}

/** Minutos previstos no plano entre o início e a data informada (inclusive), sem passar da véspera da prova. */
export function plannedMinutesUntil(now = new Date()): number {
  const start = parseISODate(PROFILE.startDate);
  const exam = parseISODate(PROFILE.examDate);
  const end = parseISODate(toISODate(now));
  let total = 0;
  for (let d = new Date(start); d <= end && d < exam; d = addDays(d, 1)) {
    total += plannedMinutesForDate(d);
  }
  return total;
}

/** Total de minutos previstos em todo o plano (início até a véspera da prova). */
export function plannedMinutesTotal(): number {
  return plannedMinutesUntil(addDays(parseISODate(PROFILE.examDate), -1));
}

export function isSameISODate(iso: string, d: Date) {
  return toISODate(new Date(iso)) === toISODate(d);
}
