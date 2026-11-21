import { useMemo, useState } from 'react';
import { DISCIPLINES, getDiscipline, trackName } from '../../data/editalData';
import { useStudyStore } from '../../hooks/useStudyStore';
import { toISODate } from '../../lib/dates';
import { cn, pct, toInt } from '../../lib/utils';
import { AccuracyChip } from '../ui/AccuracyChip';
import type { StudySession } from '../../types';
import { Button } from '../ui/button';
import { Input, Label, Select } from '../ui/input';

interface Props {
  blockId?: string;
  disciplineIds: string[];
  defaultMinutes: number;
  mode: StudySession['mode'];
  /** Data (yyyy-mm-dd) a registrar; padrão = hoje. */
  defaultDate?: string;
  submitLabel?: string;
  onSaved: () => void;
  onCancel?: () => void;
}

export function SessionForm({ blockId, disciplineIds, defaultMinutes, mode, defaultDate, submitLabel = 'Salvar sessão', onSaved, onCancel }: Props) {
  const { addSession } = useStudyStore();
  const options = disciplineIds.length ? disciplineIds : DISCIPLINES.map((d) => d.id);
  const [disciplineId, setDisciplineId] = useState(options[0]);
  const [topicId, setTopicId] = useState('');
  const [minutes, setMinutes] = useState(String(Math.max(0, Math.round(defaultMinutes))));
  const [date, setDate] = useState(defaultDate ?? toISODate(new Date()));
  const [questions, setQuestions] = useState('');
  const [correct, setCorrect] = useState('');

  const topics = useMemo(() => getDiscipline(disciplineId)?.topics ?? [], [disciplineId]);
  const q = toInt(questions);
  const c = Math.min(q, toInt(correct));
  const acc = pct(c, q);
  const invalid = toInt(correct) > q;

  const save = () => {
    const now = new Date();
    const [y, m, d] = date.split('-').map(Number);
    const when = new Date(y, m - 1, d, now.getHours(), now.getMinutes());
    addSession({
      date: when.toISOString(),
      blockId,
      disciplineId,
      topicId: topicId || undefined,
      minutes: toInt(minutes, 24 * 60),
      questions: q,
      correct: c,
      mode,
    });
    onSaved();
  };

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="sf-disc">Disciplina</Label>
          <Select
            id="sf-disc"
            value={disciplineId}
            onChange={(e) => {
              setDisciplineId(e.target.value);
              setTopicId('');
            }}
          >
            {options.map((id) => (
              <option key={id} value={id}>
                {trackName(id)}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="sf-date">Data</Label>
          <Input id="sf-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      {topics.length > 0 && (
        <div>
          <Label htmlFor="sf-topic">Tópico (opcional — as questões também entram no edital verticalizado)</Label>
          <Select id="sf-topic" value={topicId} onChange={(e) => setTopicId(e.target.value)}>
            <option value="">— Sem tópico específico —</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title.length > 90 ? `${t.title.slice(0, 90)}…` : t.title}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="sf-min">Tempo líquido (min)</Label>
          <Input id="sf-min" type="number" inputMode="numeric" min={0} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="sf-q">Questões feitas</Label>
          <Input id="sf-q" type="number" inputMode="numeric" min={0} value={questions} placeholder="0" onChange={(e) => setQuestions(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="sf-c">Certas</Label>
          <Input
            id="sf-c"
            type="number"
            inputMode="numeric"
            min={0}
            value={correct}
            placeholder="0"
            onChange={(e) => setCorrect(e.target.value)}
            className={cn(invalid && 'border-bad')}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs text-ink-dim">
          <span className="label-caps">Acerto</span>
          <AccuracyChip value={acc} />
          {invalid && <span className="text-ink-muted">certas &gt; feitas (será limitado)</span>}
        </span>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit">{submitLabel}</Button>
        </div>
      </div>
    </form>
  );
}
