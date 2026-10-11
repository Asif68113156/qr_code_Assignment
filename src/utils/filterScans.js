export const DEFAULT_FILTERS = { query: '', type: 'all', source: 'all', sort: 'newest', favorites: false };

/** Pure function: applies search + filters + sort. Easy to unit-test and safe to memoise. */
export function filterScans(scans, filters) {
  const q = filters.query.trim().toLowerCase();
  const out = scans.filter((s) => {
    if (filters.type !== 'all' && s.type !== filters.type) return false;
    if (filters.source !== 'all' && s.source !== filters.source) return false;
    if (filters.favorites && !s.favorite) return false;
    if (q) {
      const hay = `${s.value} ${s.label || ''} ${s.notes || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  out.sort((a, b) => {
    const diff = new Date(a.createdAt) - new Date(b.createdAt);
    return filters.sort === 'oldest' ? diff : -diff;
  });
  return out;
}
