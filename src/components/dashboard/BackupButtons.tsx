import { useRef, useState } from 'react';
import { Download, RotateCcw, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Modal } from '../ui/dialog';
import { useToast } from '../ui/toast';
import { buildBackup, parseBackup, useStudyStore } from '../../hooks/useStudyStore';
import { toISODate } from '../../lib/dates';
import type { AppState } from '../../types';

export function BackupButtons() {
  const { state, replaceState, resetState } = useStudyStore();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<AppState | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(buildBackup(state), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-pcac-perito-${toISODate(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Backup exportado. Guarde o arquivo em local seguro (ex.: Google Drive).');
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    try {
      const text = await file.text();
      setPending(parseBackup(text));
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Falha ao ler o arquivo.', 'error');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const summary = (s: AppState) => {
    const topicsTouched = Object.values(s.topics).filter((t) => t.t || t.r1 || t.r2 || t.questions).length;
    const minutes = s.sessions.reduce((a, x) => a + x.minutes, 0);
    return `${topicsTouched} tópicos com progresso · ${s.sessions.length} sessões (${Math.round(minutes / 60)}h) · ${s.simulados.length} simulados`;
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={exportJson} title="Baixar todo o progresso em um arquivo .json">
          <Download className="h-3.5 w-3.5" /> Exportar Dados (.json)
        </Button>
        <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} title="Restaurar progresso a partir de um backup .json">
          <Upload className="h-3.5 w-3.5" /> Importar Dados (.json)
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setConfirmReset(true)} title="Zerar todo o progresso" aria-label="Zerar progresso">
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>

      <Modal
        open={!!pending}
        onClose={() => setPending(null)}
        title="Importar backup?"
        description="Os dados atuais deste navegador serão substituídos pelo conteúdo do arquivo."
        footer={
          <>
            <Button variant="ghost" onClick={() => setPending(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (pending) replaceState(pending);
                setPending(null);
                toast('Backup importado com sucesso.');
              }}
            >
              Substituir dados
            </Button>
          </>
        }
      >
        <div className="space-y-2 text-sm text-slate-300">
          <p>
            <span className="text-slate-500">Arquivo:</span> {pending && summary(pending)}
          </p>
          <p>
            <span className="text-slate-500">Atual:</span> {summary(state)}
          </p>
          <p className="text-xs text-slate-500">Dica: exporte um backup do estado atual antes, se quiser preservá-lo.</p>
        </div>
      </Modal>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Zerar todo o progresso?"
        description="Checkboxes, questões, notas, sessões, simulados e discursivas serão apagados deste navegador."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>
              Cancelar
            </Button>
            <Button variant="secondary" onClick={exportJson}>
              <Download className="h-3.5 w-3.5" /> Exportar antes
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                resetState();
                setConfirmReset(false);
                toast('Progresso zerado.', 'info');
              }}
            >
              Zerar
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-300">Esta ação não pode ser desfeita sem um backup.</p>
      </Modal>
    </>
  );
}
