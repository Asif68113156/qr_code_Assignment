import { memo } from 'react';
import { TYPE_LABELS } from '../utils/classify';
import { formatDateTime, truncate } from '../utils/format';

/** One row. React.memo avoids re-rendering rows whose props did not change (performance optimisation). */
const HistoryItem = memo(function HistoryItem({ item, selected, onSelect, onToggleFavorite, onDelete }) {
  return (
    <li className={`history-item ${selected ? 'selected' : ''}`}>
      <button className="item-main" onClick={() => onSelect(item.id)} aria-label={`Open ${item.label || item.value}`}>
        <span className="item-title">{item.label || truncate(item.value, 50)}</span>
        <span className="item-value">{truncate(item.value, 70)}</span>
        <span className="item-meta">
          <span className={`chip type-${item.type}`}>{TYPE_LABELS[item.type] || 'Text'}</span>
          <time dateTime={item.createdAt}>{formatDateTime(item.createdAt)}</time>
        </span>
      </button>
      <div className="item-actions">
        <button
          className={`icon-btn ${item.favorite ? 'on' : ''}`}
          onClick={() => onToggleFavorite(item)}
          aria-pressed={!!item.favorite}
          aria-label={item.favorite ? 'Remove from favourites' : 'Add to favourites'}
        >
          {item.favorite ? '★' : '☆'}
        </button>
        <button className="icon-btn" onClick={() => onDelete(item.id)} aria-label="Delete scan">🗑</button>
      </div>
    </li>
  );
});

/** Renders the scan history with .map() and a unique key per item (from FA-1). */
export default function HistoryList({ items, selectedId, onSelect, onToggleFavorite, onDelete, emptyMessage }) {
  if (!items.length) return <p className="muted empty">{emptyMessage || 'No scans yet.'}</p>;
  return (
    <ul className="history-list">
      {items.map((item) => (
        <HistoryItem
          key={item.id}
          item={item}
          selected={item.id === selectedId}
          onSelect={onSelect}
          onToggleFavorite={onToggleFavorite}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
