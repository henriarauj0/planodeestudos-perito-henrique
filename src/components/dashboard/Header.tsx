import { CalendarClock, Fingerprint, HardDriveDownload } from 'lucide-react';
import { PROFILE } from '../../data/editalData';
import { useStudyStore } from '../../hooks/useStudyStore';
import { BackupButtons } from './BackupButtons';

export function Header() {
  const { storageOk, lastSavedAt } = useStudyStore();
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-500/25 to-cyan-500/5 ring-1 ring-cyan-500/30">
          <Fingerprint className="h-6 w-6 text-cyan-300" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-slate-50 sm:text-xl">Dashboard do Concurseiro</h1>
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-slate-400">
            <span>PC-AC · {PROFILE.cargo}</span>
            <span className="hidden text-slate-600 sm:inline">•</span>
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="h-3 w-3" /> Prova 24/01/2027, {PROFILE.examTimeLabel}
            </span>
          </p>
        </div>
      </div>
      <div className="flex flex-col items-start gap-1 lg:items-end">
        <BackupButtons />
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
          <HardDriveDownload className="h-3 w-3" />
          {storageOk
            ? lastSavedAt
              ? `Salvo automaticamente neste navegador às ${new Date(lastSavedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
              : 'Salvamento automático no navegador (LocalStorage) ativo'
            : 'Não foi possível salvar no navegador — exporte um backup!'}
        </span>
      </div>
    </header>
  );
}
