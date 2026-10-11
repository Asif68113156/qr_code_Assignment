import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HistoryList from '../components/HistoryList';
import SearchFilterBar from '../components/SearchFilterBar';
import { useScans } from '../context/ScansContext';
import useDebounce from '../hooks/useDebounce';
import { DEFAULT_FILTERS, filterScans } from '../utils/filterScans';

export default function HistoryPage() {
  const { scans, status, error, selectedId, updateScan, deleteScan, clearAll, reload } = useScans();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const debouncedQuery = useDebounce(filters.query, 250);

  // useMemo: re-filter only when data or filters actually change
  const visible = useMemo(
    () => filterScans(scans, { ...filters, query: debouncedQuery }),
    [scans, filters, debouncedQuery]
  );

  const reset = useCallback(() => setFilters(DEFAULT_FILTERS), []);
  const open = useCallback((id) => navigate(`/history/${id}`), [navigate]);
  const toggleFav = useCallback((s) => updateScan(s.id, { favorite: !s.favorite }, ''), [updateScan]);
  const handleClear = useCallback(() => {
    if (window.confirm('Delete ALL scan history? This cannot be undone.')) clearAll();
  }, [clearAll]);

  if (status === 'loading') return <p className="card muted" role="status">Loading history…</p>;
  if (status === 'error') {
    return (
      <div className="card error-card" role="alert">
        <h2>Could not load history</h2>
        <p className="muted">{error}</p>
        <button className="btn primary" onClick={reload}>Retry</button>
      </div>
    );
  }

  return (
    <section className="card">
      <div className="result-head">
        <h2>Scan History</h2>
        <button className="btn danger" onClick={handleClear} disabled={!scans.length}>Clear All</button>
      </div>
      <SearchFilterBar filters={filters} onChange={setFilters} onReset={reset} total={scans.length} shown={visible.length} />
      <HistoryList
        items={visible}
        selectedId={selectedId}
        onSelect={open}
        onToggleFavorite={toggleFav}
        onDelete={deleteScan}
        emptyMessage={scans.length ? 'No scans match your search or filters.' : 'No scans yet. Go to the Scanner page to add one.'}
      />
    </section>
  );
}
