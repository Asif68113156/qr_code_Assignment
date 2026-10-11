/**
 * Scans API layer (CRUD).
 *
 * Primary store  : JSON Server REST API  (http://localhost:3001/scans)
 * Fallback store : browser localStorage  (used automatically when the API is
 *                  unreachable, e.g. on a static deployment like Vercel/GitHub Pages)
 *
 * The rest of the app only talks to this module, so the storage choice is invisible to the UI.
 */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const LS_KEY = 'qr-scanner-history-v2';

const makeId = () =>
  (globalThis.crypto && globalThis.crypto.randomUUID)
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export function createScansApi({
  baseUrl = 'http://localhost:3001',
  fetchImpl = (...args) => globalThis.fetch(...args),
  storage = globalThis.localStorage,
  timeoutMs = 2500,
} = {}) {
  let mode = 'unknown'; // 'server' | 'local'

  /* ---------- localStorage helpers ---------- */
  const readLocal = () => {
    try {
      return JSON.parse(storage.getItem(LS_KEY) || '[]');
    } catch {
      return [];
    }
  };
  const writeLocal = (items) => {
    try {
      storage.setItem(LS_KEY, JSON.stringify(items));
    } catch {
      throw new ApiError('Could not save data - browser storage is full or blocked.');
    }
  };

  /* ---------- fetch helper with timeout ---------- */
  async function request(path, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetchImpl(`${baseUrl}${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        signal: controller.signal,
      });
      if (!res.ok) throw new ApiError(`Server responded with ${res.status}`, res.status);
      return res.status === 204 ? null : await res.json();
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError('Cannot reach the server. Is JSON Server running?');
    } finally {
      clearTimeout(timer);
    }
  }

  const sortNewest = (items) =>
    [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return {
    getMode: () => mode,

    /** READ - list all scans (also decides server vs local mode on first call). */
    async list() {
      try {
        const data = await request('/scans');
        mode = 'server';
        return sortNewest(data);
      } catch {
        mode = 'local';
        return sortNewest(readLocal());
      }
    },

    /** CREATE */
    async create(data) {
      const scan = {
        id: makeId(),
        label: '',
        notes: '',
        favorite: false,
        createdAt: new Date().toISOString(),
        ...data,
      };
      if (mode === 'server') {
        return request('/scans', { method: 'POST', body: JSON.stringify(scan) });
      }
      writeLocal([scan, ...readLocal()]);
      return scan;
    },

    /** UPDATE (partial) */
    async update(id, changes) {
      if (mode === 'server') {
        return request(`/scans/${id}`, { method: 'PATCH', body: JSON.stringify(changes) });
      }
      const items = readLocal();
      const idx = items.findIndex((s) => s.id === id);
      if (idx === -1) throw new ApiError('Scan not found.', 404);
      items[idx] = { ...items[idx], ...changes };
      writeLocal(items);
      return items[idx];
    },

    /** DELETE one */
    async remove(id) {
      if (mode === 'server') {
        await request(`/scans/${id}`, { method: 'DELETE' });
        return id;
      }
      writeLocal(readLocal().filter((s) => s.id !== id));
      return id;
    },

    /** DELETE all */
    async clear() {
      if (mode === 'server') {
        const all = await request('/scans');
        await Promise.all(all.map((s) => request(`/scans/${s.id}`, { method: 'DELETE' })));
        return;
      }
      writeLocal([]);
    },
  };
}

const scansApi = createScansApi({ baseUrl: import.meta.env?.VITE_API_URL || 'http://localhost:3001' });
export default scansApi;
