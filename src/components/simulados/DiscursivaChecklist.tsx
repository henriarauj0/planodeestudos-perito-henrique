import { useState } from 'react';
import { Check, PenSquare, Plus, Trash2 } from 'lucide-react';
import { DISCURSIVA_THEMES } from '../../data/editalData';
import { useStudyStore } from '../../hooks/useStudyStore';
import { fmtDate } from '../../lib/dates';
import { cn, fmtNum, toNum } from '../../lib/utils';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { useToast } from '../ui/toast';

export function DiscursivaChecklist() {
  const { state, setDiscursiva, logDiscursiva, addCustomTheme, removeCustomTheme } = useStudyStore();
  const toast = useToast();
  const [newTheme, setNewTheme] = useState('');
  const [scoring, setScoring] = useState<string | null>(null);
  const [score, setScore] = useState('');

  const themes = [...DISCURSIVA_THEMES, ...state.customThemes];
  const done = themes.filter((t) => state.discursivas[t.id]?.done).length;
  const trainings = themes.reduce((a, t) => a + (state.discursivas[t.id]?.count ?? 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenSquare className="h-4 w-4 text-violet-300" /> Discursiva – temas de Informática Forense
        </CardTitle>
        <CardDescription>
          Redação sobre conhecimentos específicos: 20 a 30 linhas, 0 a 40 pontos, mínimo 20 (subitens 11.1.1 a 11.1.3). Treine aos sábados e registre a nota.
        </CardDescription>
        <div className="mt-2 flex items-center gap-3">
          <Progress value={(done / themes.length) * 100} barClassName="bg-violet-400" label="Temas treinados" />
          <span className="shrink-0 text-xs tabular-nums text-slate-300">
            {done}/{themes.length} temas · {trainings} treinos
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <ul className="divide-y divide-slate-800/70">
          {themes.map((t) => {
            const p = state.discursivas[t.id];
            const isScoring = scoring === t.id;
            return (
              <li key={t.id} className="flex flex-col gap-2 py-2 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-start gap-2.5">
                  <button
                    role="checkbox"
                    aria-checked={!!p?.done}
                    aria-label={`Marcar tema: ${t.title}`}
                    onClick={() => setDiscursiva(t.id, { done: !p?.done })}
                    className={cn(
                      'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded ring-1 ring-inset transition-colors',
                      p?.done ? 'bg-violet-400 text-slate-950 ring-transparent' : 'ring-slate-600 hover:ring-slate-400',
                    )}
                  >
                    {p?.done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </button>
                  <div className="min-w-0">
                    <p className={cn('text-[13px] leading-snug', p?.done ? 'text-slate-400' : 'text-slate-200')}>{t.title}</p>
                    <p className="text-[11px] text-slate-500">
                      {t.hint}
                      {p?.count ? (
                        <span className="text-slate-400">
                          {t.hint ? ' · ' : ''}
                          {p.count} treino(s){p.lastDate && `, último em ${fmtDate(p.lastDate)}`}
                          {p.bestScore !== undefined && `, melhor nota ${fmtNum(p.bestScore)}/40`}
                        </span>
                      ) : null}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pl-7 sm:pl-0">
                  {isScoring ? (
                    <form
                      className="flex items-center gap-1.5"
                      onSubmit={(e) => {
                        e.preventDefault();
                        logDiscursiva(t.id, score.trim() === '' ? undefined : toNum(score, 40));
                        setScoring(null);
                        setScore('');
                        toast('Treino de discursiva registrado.');
                      }}
                    >
                      <Input
                        autoFocus
                        type="number"
                        step={0.5}
                        min={0}
                        max={40}
                        placeholder="nota /40"
                        aria-label="Nota do treino (opcional)"
                        className="h-8 w-24 text-xs"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                      />
                      <Button size="sm" type="submit">
                        Salvar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setScoring(null)}>
                        ✕
                      </Button>
                    </form>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setScoring(t.id)}>
                      <Plus className="h-3.5 w-3.5" /> Treino
                    </Button>
                  )}
                  {t.custom && (
                    <Button size="icon" variant="ghost" aria-label="Remover tema" onClick={() => removeCustomTheme(t.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <form
          className="flex gap-2 pt-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newTheme.trim()) return;
            addCustomTheme(newTheme.trim());
            setNewTheme('');
          }}
        >
          <Input value={newTheme} onChange={(e) => setNewTheme(e.target.value)} placeholder="Adicionar tema próprio…" aria-label="Novo tema" />
          <Button type="submit" variant="secondary">
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
