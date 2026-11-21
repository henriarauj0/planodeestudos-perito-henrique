import { useEffect, useState } from 'react';
import { CalendarRange, ClipboardList, LineChart } from 'lucide-react';
import { EditalTab } from './components/edital/EditalTab';
import { Header } from './components/dashboard/Header';
import { KpiCards } from './components/dashboard/KpiCards';
import { StudyTimer, TimerPill } from './components/schedule/StudyTimer';
import { WeeklySchedule } from './components/schedule/WeeklySchedule';
import { SimuladosTab } from './components/simulados/SimuladosTab';
import { Tabs } from './components/ui/tabs';
import { PROFILE } from './data/editalData';
import { useActiveTimer } from './hooks/useActiveTimer';
import { useStudyStore } from './hooks/useStudyStore';
import { fmtClock } from './lib/utils';
import { netElapsed } from './hooks/useActiveTimer';

type TabId = 'cronograma' | 'edital' | 'simulados';
const TAB_KEY = 'pcac-perito-dashboard:tab';

function readTab(): TabId {
  try {
    const t = localStorage.getItem(TAB_KEY);
    if (t === 'cronograma' || t === 'edital' || t === 'simulados') return t;
  } catch {
    /* sem acesso ao storage */
  }
  return 'cronograma';
}

export default function App() {
  const { state } = useStudyStore();
  const [tab, setTab] = useState<TabId>(readTab);
  const [timerOpen, setTimerOpen] = useState(false);
  const { timer, now, start, pause, resume, skipBreak, clear } = useActiveTimer({
    focusMin: state.settings.pomodoroFocus,
    breakMin: state.settings.pomodoroBreak,
    soundOn: state.settings.soundOn,
  });

  useEffect(() => {
    try {
      localStorage.setItem(TAB_KEY, tab);
    } catch {
      /* ignora */
    }
  }, [tab]);

  // Título da aba do navegador mostra o cronômetro em andamento.
  useEffect(() => {
    document.title = timer ? `⏱ ${fmtClock(netElapsed(timer, now))} · ${timer.label}` : 'Dashboard do Concurseiro · PC-AC Perito';
  }, [timer, now]);

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-[1600px] space-y-5 px-4 py-5 sm:px-6 lg:py-7">
        <Header />
        <KpiCards />

        <div className="flex flex-col gap-3 border-b border-line sm:flex-row sm:items-end sm:justify-between">
          <Tabs<TabId>
            value={tab}
            onChange={setTab}
            items={[
              { id: 'cronograma', code: '01', label: 'Cronograma & Timer', icon: <CalendarRange className="h-4 w-4" /> },
              { id: 'edital', code: '02', label: 'Edital Verticalizado', icon: <ClipboardList className="h-4 w-4" /> },
              { id: 'simulados', code: '03', label: 'Simulados & Discursivas', icon: <LineChart className="h-4 w-4" /> },
            ]}
          />
          <p className="label-caps hidden sm:block">Ref. {PROFILE.edital}</p>
        </div>

        <main role="tabpanel">
          {tab === 'cronograma' && (
            <WeeklySchedule
              timer={timer}
              onOpenTimer={() => setTimerOpen(true)}
              onStart={(b, mode) => {
                start({ blockId: b.id, label: b.label, disciplineIds: b.disciplineIds, mode });
                setTimerOpen(true);
              }}
            />
          )}
          {tab === 'edital' && <EditalTab />}
          {tab === 'simulados' && <SimuladosTab />}
        </main>

        <footer className="border-t border-line pt-4 text-[11px] leading-relaxed text-ink-dim">
          Dados salvos apenas neste navegador (LocalStorage). Exporte um backup .json regularmente — limpar dados do navegador ou trocar de dispositivo apaga o
          progresso. Conteúdo programático conforme Anexo III do {PROFILE.edital}; confira retificações em idecan.org.br.
        </footer>
      </div>

      {timer && (
        <>
          <StudyTimer
            open={timerOpen}
            timer={timer}
            now={now}
            onMinimize={() => setTimerOpen(false)}
            onPause={pause}
            onResume={resume}
            onSkipBreak={skipBreak}
            onDiscard={() => {
              clear();
              setTimerOpen(false);
            }}
            onFinished={() => {
              clear();
              setTimerOpen(false);
            }}
          />
          {!timerOpen && <TimerPill timer={timer} now={now} onOpen={() => setTimerOpen(true)} />}
        </>
      )}
    </div>
  );
}
