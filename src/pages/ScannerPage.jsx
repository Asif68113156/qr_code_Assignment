import { useCallback } from 'react';
import Scanner from '../components/Scanner';
import ScanResultCard from '../components/ScanResultCard';
import ManualEntryForm from '../components/ManualEntryForm';
import HistoryList from '../components/HistoryList';
import { Link, useNavigate } from 'react-router-dom';
import { useScans } from '../context/ScansContext';
import { copyText } from '../utils/clipboard';

export default function ScannerPage() {
  const { scans, selectedId, addScan, updateScan, deleteScan, selectScan, showToast } = useScans();
  const navigate = useNavigate();
  const current = scans.find((s) => s.id === selectedId) || null;

  const handleScan = useCallback((value, source) => addScan(value, source), [addScan]);
  const handleCopy = useCallback(async (text) => {
    const ok = await copyText(text);
    showToast(ok ? 'Copied to clipboard' : 'Copy failed - clipboard not available', ok ? 'success' : 'error');
  }, [showToast]);
  const handleManual = useCallback(
    async (value, label) => !!(await addScan(value, 'manual', { label })),
    [addScan]
  );
  const toggleFav = useCallback((s) => updateScan(s.id, { favorite: !s.favorite }, ''), [updateScan]);
  const open = useCallback((id) => navigate(`/history/${id}`), [navigate]);

  return (
    <div className="grid">
      <div className="col">
        <Scanner onScan={handleScan} />
        <ScanResultCard scan={current} onCopy={handleCopy} onClear={() => selectScan(null)} />
        <ManualEntryForm onSubmit={handleManual} />
      </div>
      <aside className="col">
        <section className="card">
          <div className="result-head">
            <h2>Recent Scans</h2>
            <Link to="/history" className="link">View all →</Link>
          </div>
          <HistoryList
            items={scans.slice(0, 5)}
            selectedId={selectedId}
            onSelect={open}
            onToggleFavorite={toggleFav}
            onDelete={deleteScan}
            emptyMessage="Nothing scanned yet."
          />
        </section>
      </aside>
    </div>
  );
}
