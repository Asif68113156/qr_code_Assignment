import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import scansApi from '../api/scansApi';
import { classify } from '../utils/classify';

const ScansContext = createContext(null);

const initialState = {
  scans: [],
  status: 'loading', // loading | ready | error
  error: '',
  mode: 'unknown', // server | local
  selectedId: null,
  toast: null,
};

export function scansReducer(state, action) {
  switch (action.type) {
    case 'LOAD_OK':
      return { ...state, scans: action.scans, mode: action.mode, status: 'ready', error: '' };
    case 'LOAD_FAIL':
      return { ...state, status: 'error', error: action.error };
    case 'ADD':
      return { ...state, scans: [action.scan, ...state.scans], selectedId: action.scan.id };
    case 'UPDATE':
      return { ...state, scans: state.scans.map((s) => (s.id === action.scan.id ? { ...s, ...action.scan } : s)) };
    case 'REMOVE':
      return {
        ...state,
        scans: state.scans.filter((s) => s.id !== action.id),
        selectedId: state.selectedId === action.id ? null : state.selectedId,
      };
    case 'CLEAR':
      return { ...state, scans: [], selectedId: null };
    case 'SELECT':
      return { ...state, selectedId: action.id };
    case 'TOAST':
      return { ...state, toast: action.toast };
    default:
      return state;
  }
}

export function ScansProvider({ children, api = scansApi }) {
  const [state, dispatch] = useReducer(scansReducer, initialState);

  const showToast = useCallback((message, kind = 'success') => {
    dispatch({ type: 'TOAST', toast: message ? { message, kind, id: Date.now() } : null });
  }, []);

  const load = useCallback(async () => {
    try {
      const scans = await api.list();
      dispatch({ type: 'LOAD_OK', scans, mode: api.getMode() });
    } catch (e) {
      dispatch({ type: 'LOAD_FAIL', error: e.message || 'Failed to load scans.' });
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const addScan = useCallback(
    async (value, source = 'camera', extra = {}) => {
      try {
        const scan = await api.create({ value, source, type: classify(value), ...extra });
        dispatch({ type: 'ADD', scan });
        showToast(source === 'manual' ? 'Entry saved' : 'QR code scanned');
        return scan;
      } catch (e) {
        showToast(e.message || 'Could not save the scan', 'error');
        return null;
      }
    },
    [api, showToast]
  );

  const updateScan = useCallback(
    async (id, changes, message = 'Changes saved') => {
      try {
        const scan = await api.update(id, changes);
        dispatch({ type: 'UPDATE', scan: { ...scan, id } });
        if (message) showToast(message);
        return true;
      } catch (e) {
        showToast(e.message || 'Could not update the scan', 'error');
        return false;
      }
    },
    [api, showToast]
  );

  const deleteScan = useCallback(
    async (id) => {
      try {
        await api.remove(id);
        dispatch({ type: 'REMOVE', id });
        showToast('Scan deleted');
        return true;
      } catch (e) {
        showToast(e.message || 'Could not delete the scan', 'error');
        return false;
      }
    },
    [api, showToast]
  );

  const clearAll = useCallback(async () => {
    try {
      await api.clear();
      dispatch({ type: 'CLEAR' });
      showToast('History cleared');
      return true;
    } catch (e) {
      showToast(e.message || 'Could not clear history', 'error');
      return false;
    }
  }, [api, showToast]);

  const selectScan = useCallback((id) => dispatch({ type: 'SELECT', id }), []);

  const value = useMemo(
    () => ({ ...state, addScan, updateScan, deleteScan, clearAll, selectScan, showToast, reload: load }),
    [state, addScan, updateScan, deleteScan, clearAll, selectScan, showToast, load]
  );

  return <ScansContext.Provider value={value}>{children}</ScansContext.Provider>;
}

export function useScans() {
  const ctx = useContext(ScansContext);
  if (!ctx) throw new Error('useScans must be used inside <ScansProvider>');
  return ctx;
}
