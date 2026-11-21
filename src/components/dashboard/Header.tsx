import { PROFILE } from '../../data/editalData';
import { useStudyStore } from '../../hooks/useStudyStore';
import { Badge } from '../ui/badge';
import { BackupButtons } from './BackupButtons';

export function Header() {
  const { storageOk, lastSavedAt } = useStudyStore();
  return (
    <header className="border-b border-line pb-5">
      {/* Faixa de identificação estilo dossiê */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2">
        <span className="label-caps">Concurso PC-AC · {PROFILE.edital} · Banca {PROFILE.banca}</span>
        <span className="label-caps">Ficha de acompanhamento · uso pessoal · não oficial</span>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-sm border border-line-strong bg-surface" aria-hidden>
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-ink" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
              <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">Dashboard do Concurseiro</h1>
            <p className="mt-0.5 text-sm text-ink-muted">Perito Criminal · Informática Forense</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <Badge variant="solid">Área 04 · TI</Badge>
              <Badge>Cargo S04</Badge>
              <Badge>Prova 24/01/2027 · 07h00–12h00 (AC)</Badge>
              <Badge>100 Q · 160 pts + Disc. 40</Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-1.5 lg:items-end">
          <BackupButtons />
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-dim">
            <span className={storageOk ? 'h-1.5 w-1.5 bg-ok' : 'h-1.5 w-1.5 bg-bad'} aria-hidden />
            {storageOk
              ? lastSavedAt
                ? `Salvo localmente às ${new Date(lastSavedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                : 'Salvamento local ativo (LocalStorage)'
              : 'Falha ao salvar — exporte um backup'}
          </span>
        </div>
      </div>
    </header>
  );
}
