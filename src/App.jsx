import { lazy, Suspense, useCallback } from 'react';
import { Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Toast from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import { useScans } from './context/ScansContext';
import ScannerPage from './pages/ScannerPage';

// Code-splitting: secondary pages are loaded on demand (performance optimisation)
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const ScanDetailPage = lazy(() => import('./pages/ScanDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

/** Root component - owns layout + routes. Shared state lives in ScansContext. */
export default function App() {
  const { scans, toast, mode, showToast } = useScans();
  const closeToast = useCallback(() => showToast(null), [showToast]);

  return (
    <div className="app">
      <Header
        title="QR Code Scanner"
        subtitle="Scan from camera or image - right in your browser"
        historyCount={scans.length}
      />
      {mode === 'local' && (
        <p className="banner" role="note">
          Offline mode: JSON Server not detected - history is saved in this browser (localStorage).
        </p>
      )}
      <main>
        <ErrorBoundary>
          <Suspense fallback={<p className="card muted" role="status">Loading…</p>}>
            <Routes>
              <Route path="/" element={<ScannerPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/history/:id" element={<ScanDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Toast toast={toast} onClose={closeToast} />
      <footer className="app-footer">AWT Mini Project · FA-2 · Asifali Siddiqui (125M1H050)</footer>
    </div>
  );
}
