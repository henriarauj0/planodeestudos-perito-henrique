import { useEffect, useState } from 'react';
import { BookOpen, ExternalLink, Link2, NotebookPen, XCircle } from 'lucide-react';
import { useStudyStore } from '../../hooks/useStudyStore';
import { EMPTY_TOPIC } from '../../lib/metrics';
import { Button } from '../ui/button';
import { Drawer } from '../ui/dialog';
import { Label, Textarea } from '../ui/input';
import { useToast } from '../ui/toast';

interface Props {
  topic: { id: string; title: string; ref?: string; disciplineName: string } | null;
  onClose: () => void;
}

function parseLinks(text: string) {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const m = l.match(/https?:\/\/\S+/);
      return { raw: l, url: m?.[0] ?? null, label: m ? l.replace(m[0], '').replace(/[-–|:]\s*$/, '').trim() || m[0] : l };
    });
}

export function NotesDrawer({ topic, onClose }: Props) {
  const { state, setTopicNotes } = useStudyStore();
  const toast = useToast();
  const p = topic ? state.topics[topic.id] ?? EMPTY_TOPIC : EMPTY_TOPIC;
  const [summary, setSummary] = useState('');
  const [errors, setErrors] = useState('');
  const [links, setLinks] = useState('');

  useEffect(() => {
    if (topic) {
      setSummary(p.summary);
      setErrors(p.errors);
      setLinks(p.links);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic?.id]);

  const dirty = summary !== p.summary || errors !== p.errors || links !== p.links;
  const save = () => {
    if (!topic) return;
    setTopicNotes(topic.id, { summary, errors, links });
    toast('Anotações salvas.');
  };
  const close = () => {
    if (dirty && topic) setTopicNotes(topic.id, { summary, errors, links });
    onClose();
  };

  const parsed = parseLinks(links);

  return (
    <Drawer
      open={!!topic}
      onClose={close}
      title={
        <span className="flex items-center gap-2">
          <NotebookPen className="h-4 w-4 text-cyan-300" /> Notas e caderno de erros
        </span>
      }
      description={
        topic && (
          <>
            <span className="text-slate-300">{topic.title}</span>
            <span className="mt-0.5 block text-slate-500">
              {topic.disciplineName}
              {topic.ref && ` · ${topic.ref} do Anexo III`}
            </span>
          </>
        )
      }
      footer={
        <>
          <span className="mr-auto self-center text-[11px] text-slate-500">{dirty ? 'Alterações não salvas (salvas ao fechar)' : 'Tudo salvo'}</span>
          <Button variant="ghost" onClick={close}>
            Fechar
          </Button>
          <Button onClick={save} disabled={!dirty}>
            Salvar
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <Label htmlFor="n-sum" className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> Resumo / anotações
          </Label>
          <Textarea
            id="n-sum"
            data-autofocus
            rows={8}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Pontos-chave, mnemônicos, esquemas…"
          />
        </div>
        <div>
          <Label htmlFor="n-err" className="flex items-center gap-1.5">
            <XCircle className="h-3.5 w-3.5 text-rose-300" /> Caderno de erros
          </Label>
          <Textarea
            id="n-err"
            rows={6}
            value={errors}
            onChange={(e) => setErrors(e.target.value)}
            placeholder={'Q. 123 (IDECAN 2024): confundi IDS com IPS — IDS só detecta; IPS bloqueia em linha.'}
          />
        </div>
        <div>
          <Label htmlFor="n-links" className="flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5" /> Links de materiais (um por linha)
          </Label>
          <Textarea
            id="n-links"
            rows={4}
            value={links}
            onChange={(e) => setLinks(e.target.value)}
            placeholder={'Aula PDF – https://...\nhttps://www.planalto.gov.br/...'}
          />
          {parsed.some((l) => l.url) && (
            <ul className="mt-2 space-y-1">
              {parsed
                .filter((l) => l.url)
                .map((l, i) => (
                  <li key={i}>
                    <a
                      href={l.url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-full items-center gap-1.5 truncate text-xs text-cyan-300 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      <span className="truncate">{l.label}</span>
                    </a>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </Drawer>
  );
}
