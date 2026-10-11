import { createScansApi, ApiError } from '../api/scansApi';

const failingFetch = () => Promise.reject(new TypeError('network down'));

describe('scansApi - localStorage fallback (server unreachable)', () => {
  it('falls back to local mode and supports full CRUD', async () => {
    const api = createScansApi({ fetchImpl: failingFetch, storage: localStorage });
    expect(await api.list()).toEqual([]);
    expect(api.getMode()).toBe('local');

    const created = await api.create({ value: 'hello', type: 'text', source: 'manual' });
    expect(created.id).toBeTruthy();
    expect(await api.list()).toHaveLength(1);

    const updated = await api.update(created.id, { label: 'Hi', favorite: true });
    expect(updated.label).toBe('Hi');
    expect(updated.favorite).toBe(true);

    await api.remove(created.id);
    expect(await api.list()).toHaveLength(0);
  });

  it('clear() empties storage', async () => {
    const api = createScansApi({ fetchImpl: failingFetch, storage: localStorage });
    await api.list();
    await api.create({ value: 'a' });
    await api.create({ value: 'b' });
    await api.clear();
    expect(await api.list()).toEqual([]);
  });

  it('throws ApiError(404) when updating a missing scan', async () => {
    const api = createScansApi({ fetchImpl: failingFetch, storage: localStorage });
    await api.list();
    await expect(api.update('nope', { label: 'x' })).rejects.toBeInstanceOf(ApiError);
  });
});

describe('scansApi - server mode (JSON Server)', () => {
  it('uses REST endpoints with the right verbs', async () => {
    const calls = [];
    const fetchImpl = vi.fn(async (url, opts = {}) => {
      calls.push([opts.method || 'GET', url]);
      const ok = (body, status = 200) => ({ ok: true, status, json: async () => body });
      if ((opts.method || 'GET') === 'GET') return ok([{ id: 's1', createdAt: '2026-01-01T00:00:00Z' }]);
      if (opts.method === 'DELETE') return ok(null, 200);
      return ok({ id: 's1', ...(opts.body ? JSON.parse(opts.body) : {}) });
    });
    const api = createScansApi({ baseUrl: 'http://api.test', fetchImpl, storage: localStorage });

    await api.list();
    expect(api.getMode()).toBe('server');
    await api.create({ value: 'x' });
    await api.update('s1', { label: 'L' });
    await api.remove('s1');

    expect(calls).toEqual([
      ['GET', 'http://api.test/scans'],
      ['POST', 'http://api.test/scans'],
      ['PATCH', 'http://api.test/scans/s1'],
      ['DELETE', 'http://api.test/scans/s1'],
    ]);
  });

  it('surfaces HTTP errors as ApiError', async () => {
    let first = true;
    const fetchImpl = async () => {
      if (first) { first = false; return { ok: true, status: 200, json: async () => [] }; }
      return { ok: false, status: 500, json: async () => ({}) };
    };
    const api = createScansApi({ fetchImpl, storage: localStorage });
    await api.list();
    await expect(api.create({ value: 'x' })).rejects.toMatchObject({ name: 'ApiError', status: 500 });
  });
});
