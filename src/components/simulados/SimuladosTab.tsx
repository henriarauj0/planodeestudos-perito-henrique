import { useState } from 'react';
import { AlertTriangle, LineChart, Pencil, Plus, Trash2, Trophy } from 'lucide-react';
import { DISCURSIVA_MIN, OBJECTIVE_MIN, PROFILE, SIMULADO_SUNDAYS } from '../../data/editalData';
import { useStudyStore } from '../../hooks/useStudyStore';
import { fmtDate, toISODate } from '../../lib/dates';
import { simuladoScores } from '../../lib/metrics';
import { cn, fmtNum } from '../../lib/utils';
import type { Simulado } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Modal } from '../ui/dialog';
import { useToast } from '../ui/toast';
import { DiscursivaChecklist } from './DiscursivaChecklist';
import { ScoreChart } from './ScoreChart';
import { SimuladoForm } from './SimuladoForm';

export function SimuladosTab() {
  const { state, upsertSimulado, deleteSimulado } = useStudyStore();
  const toast = useToast();
  const [editing, setEditing] = useState<Simulado | 'new' | null>(null);
  const today = toISODate(new Date());
  const nextSunday = SIMULADO_SUNDAYS.find((d) => d >= today);
  const best = state.simulados.reduce<number | null>((a, s) => Math.max(a ?? 0, simuladoScores(s).total), null);
  const last = state.simulados[state.simulados.length - 1];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-4 w-4 text-ink" /> Nota total nos simulados (/200)
              </CardTitle>
              <CardDescription>
                Objetiva (160) + discursiva (40). Simulados quinzenais: {SIMULADO_SUNDAYS.map((d) => fmtDate(d)).join(', ')}.
                {nextSunday && ` Próximo: ${fmtDate(nextSunday, { day: '2-digit', month: 'long' })}.`}
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setEditing('new')}>
              <Plus className="h-3.5 w-3.5" /> Novo simulado
            </Button>
          </CardHeader>
          <CardContent>
            <ScoreChart simulados={state.simulados} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-ink-muted" /> Referências do edital
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md bg-canvas p-3 border border-line">
                <div className="text-[11px] text-ink-dim">Melhor total</div>
                <div className="text-xl font-semibold font-mono tabular-nums text-ink">{best === null ? '—' : fmtNum(best)}</div>
              </div>
              <div className="rounded-md bg-canvas p-3 border border-line">
                <div className="text-[11px] text-ink-dim">Último</div>
                <div className="text-xl font-semibold font-mono tabular-nums text-ink">{last ? fmtNum(simuladoScores(last).total) : '—'}</div>
              </div>
            </div>
            <ul className="space-y-2 text-xs leading-relaxed text-ink-muted">
              <li>
                <span className="text-ink">Objetiva:</span> mínimo de {OBJECTIVE_MIN}/160, ao menos 1 ponto em cada disciplina básica e jurídica e 2 pontos nos
                específicos (10.5).
              </li>
              <li>
                <span className="text-ink">Discursiva:</span> mínimo de {DISCURSIVA_MIN}/40 (11.1.2).
              </li>
              <li className="rounded-sm border border-l-2 border-line border-l-warn bg-canvas p-2 text-ink-muted">
                <AlertTriangle className="mr-1 inline h-3.5 w-3.5 text-ink" />
                {PROFILE.vagas}. {PROFILE.discursivaCorrigidas} O objetivo real é ficar entre os primeiros da objetiva, não apenas passar do corte.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Simulados realizados</CardTitle>
          <CardDescription>Específicos contam em dobro: informe os acertos e o sistema calcula os pontos.</CardDescription>
        </CardHeader>
        <CardContent>
          {state.simulados.length === 0 ? (
            <p className="rounded-md border border-dashed border-line p-6 text-center text-sm text-ink-dim">Nenhum simulado registrado.</p>
          ) : (
            <div className="-mx-1 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-[11px] uppercase tracking-wide text-ink-dim">
                  <tr>
                    <th className="px-1 py-2 font-medium">Data</th>
                    <th className="px-1 py-2 font-medium">Simulado</th>
                    <th className="px-1 py-2 text-right font-medium">Básicos /24</th>
                    <th className="px-1 py-2 text-right font-medium">Jurídicos /16</th>
                    <th className="px-1 py-2 text-right font-medium">Específicos ×2 /120</th>
                    <th className="px-1 py-2 text-right font-medium">Objetiva /160</th>
                    <th className="px-1 py-2 text-right font-medium">Discursiva /40</th>
                    <th className="px-1 py-2 text-right font-medium">Total /200</th>
                    <th className="px-1 py-2 text-center font-medium">Corte</th>
                    <th className="w-16" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line font-mono tabular-nums">
                  {state.simulados.map((s) => {
                    const sc = simuladoScores(s);
                    const okObj = sc.objetiva >= OBJECTIVE_MIN && sc.especificos >= 2;
                    const okDisc = s.discursiva >= DISCURSIVA_MIN;
                    return (
                      <tr key={s.id} className="text-ink-muted">
                        <td className="whitespace-nowrap px-1 py-2 text-ink-muted">{fmtDate(s.date, { day: '2-digit', month: '2-digit', year: '2-digit' })}</td>
                        <td className="max-w-[14rem] truncate px-1 py-2" title={s.notes}>
                          {s.name}
                        </td>
                        <td className="px-1 py-2 text-right">{s.basicos}</td>
                        <td className="px-1 py-2 text-right">{s.juridicos}</td>
                        <td className="px-1 py-2 text-right text-ink">
                          {sc.especificos} <span className="text-[11px] text-ink-dim">({s.especificosAcertos} ac.)</span>
                        </td>
                        <td className={cn('px-1 py-2 text-right', !okObj && 'underline decoration-bad decoration-2 underline-offset-4')}>{sc.objetiva}</td>
                        <td className={cn('px-1 py-2 text-right', !okDisc && 'underline decoration-bad decoration-2 underline-offset-4')}>{fmtNum(s.discursiva)}</td>
                        <td className="px-1 py-2 text-right font-semibold text-ink">{fmtNum(sc.total)}</td>
                        <td className="px-1 py-2 text-center">
                          {okObj && okDisc ? (
                            <span className="inline-flex items-center gap-1.5 rounded-sm border border-ok px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink">
                              <span className="h-1.5 w-1.5 bg-ok" /> Apto
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-sm border border-bad px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink" title={!okObj ? 'Objetiva abaixo do corte' : 'Discursiva abaixo de 20'}>
                              <span className="h-1.5 w-1.5 bg-bad" /> {!okObj ? 'Objetiva' : 'Discursiva'}
                            </span>
                          )}
                        </td>
                        <td className="px-1 py-2 text-right">
                          <div className="flex justify-end gap-0.5">
                            <button className="rounded p-1 text-ink-dim hover:bg-surface-2 hover:text-ink" aria-label="Editar" onClick={() => setEditing(s)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              className="rounded p-1 text-ink-dim hover:bg-surface-2 hover:text-ink"
                              aria-label="Excluir"
                              onClick={() => {
                                deleteSimulado(s.id);
                                toast('Simulado excluído.', 'info');
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <DiscursivaChecklist />

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Registrar simulado' : 'Editar simulado'}
        description="Pontuação no formato da prova: 100 questões (160 pontos) + discursiva (40 pontos)."
        className="max-w-2xl"
      >
        {editing !== null && (
          <SimuladoForm
            initial={editing === 'new' ? undefined : editing}
            defaultDate={nextSunday && nextSunday <= today ? nextSunday : today}
            onCancel={() => setEditing(null)}
            onSave={(s) => {
              upsertSimulado(s);
              setEditing(null);
              toast(editing === 'new' ? 'Simulado registrado.' : 'Simulado atualizado.');
            }}
          />
        )}
      </Modal>
    </div>
  );
}
