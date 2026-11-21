import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import './index.css';
import App from './App';
import { StudyStoreProvider } from './hooks/useStudyStore';
import { ToastProvider } from './components/ui/toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StudyStoreProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </StudyStoreProvider>
  </StrictMode>,
);
