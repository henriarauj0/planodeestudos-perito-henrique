import { useCallback, useMemo, useState } from 'react';
import { ChevronDown, ChevronsDownUp, ChevronsUpDown, Info, Search } from 'lucide-react';
import { DISCIPLINES, EXAM_BLOCKS } from '../../data/editalData';
import { useStudyStore } from '../../hooks/useStudyStore';
import { allDisciplineStats, blockQuestionStats, topicProgress, weightedProgress } from '../../lib/metrics';
import { TONE } from '../../lib/theme';
import { ACCURACY_CLASSES, accuracyTone, cn, fmtHours, fmtPct, toInt } from '../../lib/utils';
import type { Topic } from '../../types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input, Select } from '../ui/input';
import { Progress } from '../ui/progress';
import { NotesDrawer } from './NotesDrawer';
import { TopicRow } from './TopicRow';

type Filter = 'todos' | 'sem-teoria' | 'sem-revisao' | 'abaixo' | 'com-notas' | 'novos';

const ACCENT_BG: Record<string, string> = {
  especificos: 'bg-cyan-400',
  basicos: 'bg-amber-400',
  juridicos: 'bg-emerald-400',
};

export function EditalTab() {
  const { state, updateSettings } = useStudyStore();
  const stats = allDisciplineStats(state);
  const [open, setOpen] = useState<Set<string>>(() => new Set(['ti']));
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('todos');
  const [notesTopic, setNotesTopic] = useState<{ id: string; title: string; ref?: string; disciplineName: string } | null>(null);
  const threshold = state.settings.alertThreshold;

  const q = query.trim().toLowerCase();
  const matches = useCallback(
    (t: Topic) => {
      const p = state.topics[t.id];
      if (q && !t.title.toLowerCase().includes(q)) return false;
      switch (filter) {
        case 'sem-teoria':
          return !p?.t;
        case 'sem-revisao':
          return !!p?.t && (!p.r1 || !p.r2);
        case 'abaixo':
          return !!p && p.questions > 0 && (p.correct / p.questions) * 100 < threshold;
        case 'com-notas':
          return !!p && !!(p.summary || p.errors || p.links);
        case 'novos':
          return t.origin === 'edital';
        default:
          return true;
      }
    },
    [q, filter, state.topics, threshold],
  );

  const filtering = q !== '' || filter !== 'todos';
  const visibleCount = useMemo(() => DISCIPLINES.reduce((a, d) => a + d.topics.filter(matches).length, 0), [matches]);
  const totalTopics = DISCIPLINES.reduce((a, d) => a + d.topics.length, 0);

  const toggle = (id: string) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div className="space-y-4">
      <Card className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar tópico (ex.: NTFS, crase, art. 144)…" className="pl-9" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={filter} onChange={(e) => setFilter(e.target.value as Filter)} className="w-auto" aria-label="Filtro">
            <option value="todos">Todos os tópicos</option>
            <option value="sem-teoria">Sem teoria [T]</option>
            <option value="sem-revisao">Teoria feita, revisão pendente</option>
            <option value="abaixo">Acerto abaixo da meta</option>
            <option value="com-notas">Com notas / erros</option>
            <option value="novos">Acrescentados do edital</option>
          </Select>
          <label className="flex items-center gap-1.5 text-xs text-slate-400" title="Meta pessoal de acerto usada nos alertas">
            Meta
            <Input
              type="number"
              min={0}
              max={100}
              className="h-9 w-16 px-2 text-center"
              value={threshold}
              onChange={(e) => updateSettings({ alertThreshold: toInt(e.target.value, 100) })}
            />
            %
          </label>
          <Button variant="outline" size="sm" onClick={() => setOpen(new Set(DISCIPLINES.map((d) => d.id)))}>
            <ChevronsUpDown className="h-3.5 w-3.5" /> Expandir
          </Button>
          <Button variant="outline" size="sm" onClick={() => setOpen(new Set())}>
            <ChevronsDownUp className="h-3.5 w-3.5" /> Recolher
          </Button>
        </div>
      </Card>

      {filtering && (
        <p className="text-xs text-slate-400">
          Exibindo {visibleCount} de {totalTopics} tópicos.
        </p>
      )}

      {EXAM_BLOCKS.map((block) => {
        const tone = TONE[block.id];
        const disciplines = DISCIPLINES.filter((d) => d.block === block.id);
        const bProg = weightedProgress(stats, block.id) * 100;
        const bq = blockQuestionStats(stats, block.id);
        return (
          <section key={block.id} className="space-y-2">
            <div className="flex flex-wrap items-end justify-between gap-2 px-1">
              <div>
                <h2 className={cn('flex items-center gap-2 text-sm font-semibold uppercase tracking-wide', tone.text)}>
                  <span className={cn('h-2.5 w-2.5 rounded-full', tone.dot)} />
                  {block.name}
                  <span className="font-normal normal-case tracking-normal text-slate-400">
                    · {block.questions} questões · peso {block.weight} · {block.maxPoints} pontos
                  </span>
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-500">{block.minRule}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>
                  Progresso <span className="font-semibold tabular-nums text-slate-200">{fmtPct(bProg)}</span>
                </span>
                <span>
                  Acerto <span className="font-semibold tabular-nums text-slate-200">{fmtPct(bq.accuracy)}</span>
                </span>
              </div>
            </div>

            {disciplines.map((d) => {
              const s = stats[d.id];
              const visible = d.topics.filter(matches);
              if (filtering && visible.length === 0) return null;
              const isOpen = open.has(d.id) || (filtering && visible.length > 0);
              const below = s.accuracy !== null && s.accuracy < threshold;
              return (
                <Card key={d.id} className={cn('overflow-hidden', below && 'border-rose-500/40')}>
                  <button
                    onClick={() => toggle(d.id)}
                    aria-expanded={isOpen}
                    className="flex w-full flex-col gap-2 p-3 text-left hover:bg-slate-800/30 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <ChevronDown className={cn('h-4 w-4 shrink-0 text-slate-500 transition-transform', isOpen && 'rotate-180')} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-slate-100">{d.name}</span>
                          <Badge className={cn(tone.soft, tone.text, tone.ring)}>
                            {d.questions} q × {d.weight} = {d.questions * d.weight} pts
                          </Badge>
                          {d.estimated && (
                            <Badge title="O edital não fixa quantas das 60 questões específicas são de cada parte; valor estimado pela proporção de itens do Anexo III.">
                              <Info className="h-3 w-3" /> estimativa
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-slate-500">
                          <span>
                            T {s.theoryDone}/{s.topicsTotal}
                          </span>
                          <span>
                            R1 {s.r1Done}/{s.topicsTotal}
                          </span>
                          <span>
                            R2 {s.r2Done}/{s.topicsTotal}
                          </span>
                          <span>{fmtHours(s.minutes)} estudadas</span>
                          <span>
                            {s.correct}/{s.questions} questões
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pl-7 sm:pl-0">
                      <div className="w-32">
                        <Progress value={s.progress * 100} barClassName={tone.bar} label={`Progresso de ${d.name}`} />
                      </div>
                      <span className="w-10 text-right text-xs tabular-nums text-slate-300">{fmtPct(s.progress * 100)}</span>
                      <span className={cn('w-14 rounded-md py-1 text-center text-xs font-semibold tabular-nums ring-1', ACCURACY_CLASSES[accuracyTone(s.accuracy)])}>
                        {fmtPct(s.accuracy)}
                      </span>
                    </div>
                  </button>
                  {isOpen && (
                    <ul className="bg-slate-950/30">
                      {(filtering ? visible : d.topics).map((t) => (
                        <TopicRow
                          key={t.id}
                          topic={t}
                          index={d.topics.indexOf(t)}
                          progress={state.topics[t.id]}
                          accent={ACCENT_BG[block.id]}
                          onOpenNotes={(topic) => setNotesTopic({ id: topic.id, title: topic.title, ref: topic.ref, disciplineName: d.name })}
                        />
                      ))}
                      <li className="flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-800/70 px-3 py-2 text-[11px] text-slate-500">
                        <span>Ponderação do tópico: T = 60%, R1 = 20%, R2 = 20%.</span>
                        <span>
                          Concluídos (T+R1+R2): {d.topics.filter((t) => topicProgress(state.topics[t.id]) >= 0.999).length}/{d.topics.length}
                        </span>
                      </li>
                    </ul>
                  )}
                </Card>
              );
            })}
          </section>
        );
      })}

      <NotesDrawer topic={notesTopic} onClose={() => setNotesTopic(null)} />
    </div>
  );
}
