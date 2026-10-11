import { memo } from 'react';
import { TYPE_LABELS, SOURCE_LABELS } from '../utils/classify';

/** Controlled search + filter + sort controls. State lives in HistoryPage. */
function SearchFilterBar({ filters, onChange, onReset, total, shown }) {
  const set = (name) => (e) =>
    onChange({ ...filters, [name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  return (
    <div className="filter-bar" role="search">
      <input
        type="search" placeholder="Search value, label or notes…" aria-label="Search history"
        value={filters.query} onChange={set('query')}
      />
      <select aria-label="Filter by type" value={filters.type} onChange={set('type')}>
        <option value="all">All types</option>
        {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <select aria-label="Filter by source" value={filters.source} onChange={set('source')}>
        <option value="all">All sources</option>
        {Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <select aria-label="Sort order" value={filters.sort} onChange={set('sort')}>
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>
      <label className="check">
        <input type="checkbox" checked={filters.favorites} onChange={set('favorites')} /> ★ Favourites
      </label>
      <button className="btn ghost" onClick={onReset}>Reset</button>
      <span className="muted small count">Showing {shown} of {total}</span>
    </div>
  );
}

export default memo(SearchFilterBar);
