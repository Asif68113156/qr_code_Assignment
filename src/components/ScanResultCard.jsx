import { Link } from 'react-router-dom';
import { isUrl, TYPE_LABELS, SOURCE_LABELS } from '../utils/classify';
import { formatDateTime } from '../utils/format';

/** Shows the current result with conditional actions (Open Link only for URLs). */
export default function ScanResultCard({ scan, onCopy, onClear }) {
  if (!scan) {
    return (
      <section className="card result" aria-label="Scan result">
        <h2>Scan Result</h2>
        <p className="muted empty">No result yet. Scan a QR code to see its content here.</p>
      </section>
    );
  }
  return (
    <section className="card result" aria-label="Scan result">
      <div className="result-head">
        <h2>Scan Result</h2>
        <span className={`chip type-${scan.type}`}>{TYPE_LABELS[scan.type] || 'Text'}</span>
      </div>
      <p className="value" data-testid="result-value">{scan.value}</p>
      <p className="muted small">
        {SOURCE_LABELS[scan.source] || scan.source} · {formatDateTime(scan.createdAt)}
      </p>
      <div className="actions">
        {isUrl(scan.value) && (
          <a className="btn primary" href={scan.value} target="_blank" rel="noopener noreferrer">
            ↗ Open Link
          </a>
        )}
        <button className="btn" onClick={() => onCopy(scan.value)}>⧉ Copy</button>
        <Link className="btn" to={`/history/${scan.id}`}>✎ Details</Link>
        <button className="btn ghost" onClick={onClear}>Clear</button>
      </div>
    </section>
  );
}
