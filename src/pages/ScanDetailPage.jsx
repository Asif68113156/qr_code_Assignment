import { useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import EditScanForm from '../components/EditScanForm';
import { useScans } from '../context/ScansContext';
import { isUrl, SOURCE_LABELS, TYPE_LABELS } from '../utils/classify';
import { copyText } from '../utils/clipboard';
import { formatDateTime } from '../utils/format';

export default function ScanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { scans, status, updateScan, deleteScan, showToast } = useScans();
  const scan = scans.find((s) => s.id === id);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Delete this scan?')) return;
    if (await deleteScan(id)) navigate('/history');
  }, [deleteScan, id, navigate]);

  const handleCopy = async () => {
    const ok = await copyText(scan.value);
    showToast(ok ? 'Copied to clipboard' : 'Copy failed', ok ? 'success' : 'error');
  };

  if (status === 'loading') return <p className="card muted" role="status">Loading…</p>;
  if (!scan) {
    return (
      <div className="card error-card" role="alert">
        <h2>Scan not found</h2>
        <p className="muted">This entry may have been deleted.</p>
        <Link className="btn primary" to="/history">Back to history</Link>
      </div>
    );
  }

  return (
    <div className="grid">
      <section className="card">
        <div className="result-head">
          <h2>Scan Details</h2>
          <span className={`chip type-${scan.type}`}>{TYPE_LABELS[scan.type]}</span>
        </div>
        <p className="value">{scan.value}</p>
        <p className="muted small">
          {SOURCE_LABELS[scan.source] || scan.source} · {formatDateTime(scan.createdAt)}
        </p>
        <div className="actions">
          {isUrl(scan.value) && (
            <a className="btn primary" href={scan.value} target="_blank" rel="noopener noreferrer">↗ Open Link</a>
          )}
          <button className="btn" onClick={handleCopy}>⧉ Copy</button>
          <button className="btn" onClick={() => updateScan(scan.id, { favorite: !scan.favorite }, scan.favorite ? 'Removed from favourites' : 'Added to favourites')}>
            {scan.favorite ? '★ Favourite' : '☆ Mark favourite'}
          </button>
          <button className="btn danger" onClick={handleDelete}>🗑 Delete</button>
        </div>
        <Link className="link" to="/history">← Back to history</Link>
      </section>
      <section className="card">
        <h2>Edit Label &amp; Notes</h2>
        <EditScanForm key={scan.id} scan={scan} onSave={(changes) => updateScan(scan.id, changes)} />
      </section>
    </div>
  );
}
