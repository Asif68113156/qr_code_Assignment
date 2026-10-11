import { DEFAULT_FILTERS, filterScans } from '../utils/filterScans';

const data = [
  { id: '1', value: 'https://react.dev', label: 'React', notes: '', type: 'url', source: 'camera', favorite: true, createdAt: '2026-09-01T10:00:00Z' },
  { id: '2', value: 'hello', label: 'Greeting', notes: 'plain text', type: 'text', source: 'manual', favorite: false, createdAt: '2026-09-02T10:00:00Z' },
  { id: '3', value: 'WIFI:S:Lab;;', label: 'Lab', notes: '', type: 'wifi', source: 'upload', favorite: false, createdAt: '2026-09-03T10:00:00Z' },
];

describe('filterScans', () => {
  it('returns newest first by default', () => {
    expect(filterScans(data, DEFAULT_FILTERS).map((s) => s.id)).toEqual(['3', '2', '1']);
  });
  it('sorts oldest first', () => {
    expect(filterScans(data, { ...DEFAULT_FILTERS, sort: 'oldest' })[0].id).toBe('1');
  });
  it('searches value, label and notes (case-insensitive)', () => {
    expect(filterScans(data, { ...DEFAULT_FILTERS, query: 'REACT' })).toHaveLength(1);
    expect(filterScans(data, { ...DEFAULT_FILTERS, query: 'plain' })[0].id).toBe('2');
  });
  it('filters by type, source and favourites', () => {
    expect(filterScans(data, { ...DEFAULT_FILTERS, type: 'wifi' })).toHaveLength(1);
    expect(filterScans(data, { ...DEFAULT_FILTERS, source: 'manual' })[0].id).toBe('2');
    expect(filterScans(data, { ...DEFAULT_FILTERS, favorites: true })[0].id).toBe('1');
  });
  it('does not mutate the input array', () => {
    const copy = [...data];
    filterScans(data, DEFAULT_FILTERS);
    expect(data).toEqual(copy);
  });
});
