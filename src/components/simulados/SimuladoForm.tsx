import { useState } from 'react';
import { DISCURSIVA_MIN, OBJECTIVE_MIN } from '../../data/editalData';
import { simuladoScores } from '../../lib/metrics';
import { cn, fmtNum, toInt, toNum, uid } from '../../lib/utils';
import type { Simulado } from '../../types';
import { Button } from '../ui/button';
import { Input, Label, Textarea } from '../ui/input';

interface Props {
  initial?: Simulado;
  defaultDate: string;
  onSave: (s: Simulado) => void;
  onCancel: () => void;
}

export function SimuladoForm({ initial, defaultDate, onSave, onCancel }: Props) {
  const [date, setDate] = useState(initial?.date ?? defaultDate);
  const [name, setName] = useState(initial?.name ?? '');
  const [basicos, setBasicos] = useState(String(initial?.basicos ?? ''));
  const [juridicos, setJuridicos] = useState(String(initial?.juridicos ?? ''));
  const [esp, setEsp] = useState(String(initial?.especificosAcertos ?? ''));
  const [disc, setDisc] = useState(String(initial?.discursiva ?? ''));
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const draft: Simulado = {
    id: initial?.id ?? uid('sim'),
    date,
    name: name.trim() || 'Simulado',
    basicos: toInt(basicos, 24),
    juridicos: toInt(juridicos, 16),
    especificosAcertos: toInt(esp, 60),
    discursiva: toNum(disc, 40),
    notes: notes.trim() || undefined,
  };
  const sc = simuladoScores(draft);

  const field = (id: string, label: string, value: string, set: (v: string) => void, max: number, step = 1) => (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="number" min={0} max={max} step={step} inputMode="decimal" placeholder="0" value={value} onChange={(e) => set(e.target.value)} />
    </div>
  );

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(draft);
      }}
    >
      <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
        <div>
          <Label htmlFor="sim-date">Data</Label>
          <Input id="sim-date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="sim-name">Nome / fonte</Label>
          <Input id="sim-name" value={name} placeholder="Ex.: Simulado 1 – IDECAN Perito" onChange={(e) => setName(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {field('sim-b', 'Básicos (acertos /24)', basicos, setBasicos, 24)}
        {field('sim-j', 'Jurídicos (acertos /16)', juridicos, setJuridicos, 16)}
        {field('sim-e', 'Específicos (acertos /60)', esp, setEsp, 60)}
        {field('sim-d', 'Discursiva (/40)', disc, setDisc, 40, 0.5)}
      </div>
      <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-950/60 p-3 text-center ring-1 ring-slate-800">
        <div>
          <div className="text-[11px] text-slate-500">Específicos ×2</div>
          <div className="text-lg font-semibold tabular-nums text-cyan-300">{sc.especificos}/120</div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500">Objetiva</div>
          <div className={cn('text-lg font-semibold tabular-nums', sc.objetiva >= OBJECTIVE_MIN ? 'text-slate-100' : 'text-rose-300')}>{sc.objetiva}/160</div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500">Total</div>
          <div className="text-lg font-semibold tabular-nums text-slate-50">{fmtNum(sc.total)}/200</div>
        </div>
      </div>
      <p className="text-[11px] text-slate-500">
        Corte do edital: objetiva ≥ {OBJECTIVE_MIN} pontos (10.5, a) e discursiva ≥ {DISCURSIVA_MIN} pontos (11.1.2).
      </p>
      <div>
        <Label htmlFor="sim-notes">Observações (opcional)</Label>
        <Textarea id="sim-notes" rows={2} className="min-h-0" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Gestão do tempo, assuntos que mais erraram…" />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{initial ? 'Salvar alterações' : 'Adicionar simulado'}</Button>
      </div>
    </form>
  );
}
