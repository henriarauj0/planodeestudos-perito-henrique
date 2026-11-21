import { memo, useEffect, useState } from 'react';
import { NotebookPen } from 'lucide-react';
import { useStudyStore } from '../../hooks/useStudyStore';
import { EMPTY_TOPIC } from '../../lib/metrics';
import { ACCURACY_CLASSES, accuracyTone, cn, fmtPct, pct, toInt } from '../../lib/utils';
import type { Topic, TopicProgress } from '../../types';

const STAGES: { key: 't' | 'r1' | 'r2'; label: string; title: string }[] = [
  { key: 't', label: 'T', title: 'Teoria' },
  { key: 'r1', label: 'R1', title: 'Revisão 1' },
  { key: 'r2', label: 'R2', title: 'Revisão 2' },
];

interface Props {
  topic: Topic;
  index: number;
  progress?: TopicProgress;
  accent: string;
  onOpenNotes: (topic: Topic) => void;
}

/** Campo numérico que só grava no estado ao sair/Enter (evita perder foco a cada tecla). */
function NumField({ value, onCommit, label, invalid }: { value: number; onCommit: (v: number) => void; label: string; invalid?: boolean }) {
  const [draft, setDraft] = useState(String(value || ''));
  useEffect(() => setDraft(value ? String(value) : ''), [value]);
  const commit = () => {
    const v = toInt(draft);
    if (v !== value) onCommit(v);
    setDraft(v ? String(v) : '');
  };
  return (
    <input
      aria-label={label}
      inputMode="numeric"
      type="number"
      min={0}
      placeholder="0"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
      className={cn(
        'h-8 w-14 rounded-md border border-slate-700 bg-slate-950/60 px-2 text-center text-sm tabular-nums text-slate-100 placeholder:text-slate-600',
        'focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30',
        invalid && 'border-rose-500',
      )}
    />
  );
}

export const TopicRow = memo(function TopicRow({ topic, index, progress, accent, onOpenNotes }: Props) {
  const { toggleStage, setTopicQuestions } = useStudyStore();
  const p = progress ?? EMPTY_TOPIC;
  const acc = pct(p.correct, p.questions);
  const hasNotes = !!(p.summary || p.errors || p.links);

  return (
    <li className="group grid grid-cols-1 gap-2 border-t border-slate-800/70 px-3 py-2.5 md:grid-cols-[1fr_auto] md:items-center md:gap-4">
      <div className="flex min-w-0 items-start gap-2.5">
        <span className="mt-0.5 w-6 shrink-0 text-right text-xs tabular-nums text-slate-600">{index + 1}.</span>
        <div className="min-w-0">
          <p className={cn('text-[13px] leading-snug', p.t && p.r1 && p.r2 ? 'text-slate-400' : 'text-slate-200')}>{topic.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {topic.ref && <span className="text-[10px] text-slate-500">{topic.ref}</span>}
            {topic.origin === 'edital' && (
              <span
                className="rounded bg-sky-500/10 px-1 text-[10px] font-medium text-sky-300 ring-1 ring-sky-500/30"
                title="Tópico do Anexo III que não constava da lista original do aluno"
              >
                + edital
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pl-8 md:flex-nowrap md:pl-0">
        <div className="flex gap-1" role="group" aria-label="Etapas">
          {STAGES.map((s) => {
            const on = p[s.key];
            return (
              <button
                key={s.key}
                role="checkbox"
                aria-checked={on}
                title={s.title}
                onClick={() => toggleStage(topic.id, s.key)}
                className={cn(
                  'h-8 min-w-[2.25rem] rounded-md px-2 text-xs font-semibold ring-1 ring-inset transition-colors',
                  on ? cn(accent, 'text-slate-950 ring-transparent') : 'bg-slate-950/60 text-slate-400 ring-slate-700 hover:text-slate-100 hover:ring-slate-500',
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-500">
          <NumField label="Questões feitas" value={p.questions} onCommit={(v) => setTopicQuestions(topic.id, v, p.correct)} />
          <span>/</span>
          <NumField
            label="Questões certas"
            value={p.correct}
            onCommit={(v) => setTopicQuestions(topic.id, p.questions, v)}
          />
        </div>

        <span className={cn('w-12 rounded-md py-1 text-center text-xs font-semibold tabular-nums ring-1', ACCURACY_CLASSES[accuracyTone(acc)])} title="% de acerto">
          {fmtPct(acc)}
        </span>

        <button
          onClick={() => onOpenNotes(topic)}
          className={cn(
            'grid h-8 w-8 place-items-center rounded-md ring-1 ring-inset transition-colors',
            hasNotes ? 'bg-cyan-500/15 text-cyan-300 ring-cyan-500/40' : 'text-slate-500 ring-slate-700 hover:text-slate-200',
          )}
          aria-label="Notas e caderno de erros"
          title={hasNotes ? 'Ver notas / caderno de erros' : 'Adicionar notas / caderno de erros'}
        >
          <NotebookPen className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
});
