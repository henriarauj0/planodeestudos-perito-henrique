import { memo, useEffect, useState } from 'react';
import { NotebookPen } from 'lucide-react';
import { useStudyStore } from '../../hooks/useStudyStore';
import { EMPTY_TOPIC } from '../../lib/metrics';
import { cn, pad2, pct, toInt } from '../../lib/utils';
import type { Topic, TopicProgress } from '../../types';
import { AccuracyChip } from '../ui/AccuracyChip';
import { Badge } from '../ui/badge';
import { LegalText } from '../ui/LegalText';

const STAGES: { key: 't' | 'r1' | 'r2'; label: string; title: string }[] = [
  { key: 't', label: 'T', title: 'Teoria' },
  { key: 'r1', label: 'R1', title: 'Revisão 1' },
  { key: 'r2', label: 'R2', title: 'Revisão 2' },
];

interface Props {
  topic: Topic;
  index: number;
  progress?: TopicProgress;
  code: string;
  onOpenNotes: (topic: Topic) => void;
}

/** Campo numérico que só grava no estado ao sair/Enter (evita perder foco a cada tecla). */
function NumField({ value, onCommit, label }: { value: number; onCommit: (v: number) => void; label: string }) {
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
      className="h-7 w-12 rounded-sm border border-line bg-canvas px-1 text-center font-mono text-xs tabular-nums text-ink placeholder:text-ink-faint focus:border-ink-muted focus:outline-none"
    />
  );
}

export const TopicRow = memo(function TopicRow({ topic, index, progress, code, onOpenNotes }: Props) {
  const { toggleStage, setTopicQuestions } = useStudyStore();
  const p = progress ?? EMPTY_TOPIC;
  const acc = pct(p.correct, p.questions);
  const hasNotes = !!(p.summary || p.errors || p.links);
  const closed = p.t && p.r1 && p.r2;

  return (
    <li className="grid grid-cols-1 gap-2 border-t border-line px-3 py-2.5 md:grid-cols-[1fr_auto] md:items-center md:gap-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 w-12 shrink-0 font-mono text-[10px] text-ink-faint">
          {code}-{pad2(index + 1)}
        </span>
        <div className="min-w-0">
          <p className={cn('text-[13px] leading-relaxed', closed ? 'text-ink-dim line-through decoration-line-strong' : 'text-ink')}>
            <LegalText text={topic.title} />
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {topic.ref && <Badge variant="muted">Anexo III · {topic.ref}</Badge>}
            {topic.origin === 'edital' && (
              <Badge title="Tópico do Anexo III que não constava da lista original do aluno">+ Edital</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pl-[3.75rem] md:flex-nowrap md:pl-0">
        <div className="flex" role="group" aria-label="Etapas">
          {STAGES.map((s, i) => {
            const on = p[s.key];
            return (
              <button
                key={s.key}
                role="checkbox"
                aria-checked={on}
                title={s.title}
                onClick={() => toggleStage(topic.id, s.key)}
                className={cn(
                  'h-7 min-w-[2.25rem] border px-2 font-mono text-[11px] font-medium transition-colors',
                  i === 0 && 'rounded-l-sm',
                  i === STAGES.length - 1 && 'rounded-r-sm',
                  i > 0 && '-ml-px',
                  on ? 'relative z-10 border-white bg-white text-canvas' : 'border-line bg-canvas text-ink-dim hover:text-ink',
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 font-mono text-xs text-ink-faint">
          <NumField label="Questões feitas" value={p.questions} onCommit={(v) => setTopicQuestions(topic.id, v, p.correct)} />
          <span>/</span>
          <NumField label="Questões certas" value={p.correct} onCommit={(v) => setTopicQuestions(topic.id, p.questions, v)} />
        </div>

        <AccuracyChip value={acc} />

        <button
          onClick={() => onOpenNotes(topic)}
          className={cn(
            'grid h-7 w-7 place-items-center rounded-sm border transition-colors',
            hasNotes ? 'border-ink-muted bg-surface-2 text-ink' : 'border-line text-ink-dim hover:text-ink',
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
