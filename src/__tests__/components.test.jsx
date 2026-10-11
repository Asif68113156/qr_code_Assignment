import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { ScansProvider, scansReducer } from '../context/ScansContext';
import { createScansApi } from '../api/scansApi';
import HistoryList from '../components/HistoryList';
import ManualEntryForm from '../components/ManualEntryForm';
import EditScanForm from '../components/EditScanForm';
import ScanResultCard from '../components/ScanResultCard';

const offlineApi = () => createScansApi({ fetchImpl: () => Promise.reject(new Error('x')), storage: localStorage });

function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ScansProvider api={offlineApi()}>
        <App />
      </ScansProvider>
    </MemoryRouter>
  );
}

describe('HistoryList', () => {
  const items = [
    { id: 'a', value: 'https://a.com', type: 'url', label: 'Site A', favorite: false, createdAt: '2026-09-01T10:00:00Z' },
    { id: 'b', value: 'plain', type: 'text', label: '', favorite: true, createdAt: '2026-09-02T10:00:00Z' },
  ];
  it('renders one row per item and shows empty message', () => {
    const { rerender } = render(<HistoryList items={items} onSelect={() => {}} onToggleFavorite={() => {}} onDelete={() => {}} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    rerender(<HistoryList items={[]} emptyMessage="Nothing here" onSelect={() => {}} onToggleFavorite={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });
  it('fires callbacks', async () => {
    const onDelete = vi.fn();
    const onSelect = vi.fn();
    render(<HistoryList items={items} onSelect={onSelect} onToggleFavorite={() => {}} onDelete={onDelete} />);
    await userEvent.click(screen.getAllByLabelText('Delete scan')[0]);
    expect(onDelete).toHaveBeenCalledWith('a');
    await userEvent.click(screen.getByLabelText('Open Site A'));
    expect(onSelect).toHaveBeenCalledWith('a');
  });
});

describe('ScanResultCard conditional rendering', () => {
  const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);
  it('shows empty state when there is no scan', () => {
    wrap(<ScanResultCard scan={null} onCopy={() => {}} onClear={() => {}} />);
    expect(screen.getByText(/No result yet/i)).toBeInTheDocument();
  });
  it('shows Open Link only for URLs', () => {
    const base = { id: '1', source: 'camera', createdAt: '2026-09-01T10:00:00Z' };
    const { rerender } = wrap(<ScanResultCard scan={{ ...base, value: 'https://x.com', type: 'url' }} onCopy={() => {}} onClear={() => {}} />);
    expect(screen.getByText(/Open Link/)).toBeInTheDocument();
    rerender(<MemoryRouter><ScanResultCard scan={{ ...base, value: 'plain text', type: 'text' }} onCopy={() => {}} onClear={() => {}} /></MemoryRouter>);
    expect(screen.queryByText(/Open Link/)).not.toBeInTheDocument();
  });
});

describe('Forms with validation', () => {
  it('ManualEntryForm blocks empty submit and shows error', async () => {
    const onSubmit = vi.fn();
    render(<ManualEntryForm onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: /save entry/i }));
    expect(screen.getByText(/QR content is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
  it('ManualEntryForm submits valid data and resets', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    render(<ManualEntryForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText(/QR content/i), '  hello  ');
    await userEvent.type(screen.getByLabelText(/Label/i), 'Greeting');
    await userEvent.click(screen.getByRole('button', { name: /save entry/i }));
    expect(onSubmit).toHaveBeenCalledWith('hello', 'Greeting');
    await waitFor(() => expect(screen.getByLabelText(/QR content/i)).toHaveValue(''));
  });
  it('EditScanForm validates label', async () => {
    const onSave = vi.fn();
    render(<EditScanForm scan={{ label: 'ok', notes: '' }} onSave={onSave} />);
    await userEvent.clear(screen.getByLabelText(/Label/i));
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(screen.getByText(/Label is required/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });
});

describe('scansReducer', () => {
  it('ADD / UPDATE / REMOVE / CLEAR', () => {
    let s = { scans: [], selectedId: null };
    s = scansReducer(s, { type: 'ADD', scan: { id: '1', value: 'a' } });
    expect(s.scans).toHaveLength(1);
    expect(s.selectedId).toBe('1');
    s = scansReducer(s, { type: 'UPDATE', scan: { id: '1', label: 'L' } });
    expect(s.scans[0].label).toBe('L');
    s = scansReducer(s, { type: 'REMOVE', id: '1' });
    expect(s.scans).toHaveLength(0);
    expect(s.selectedId).toBeNull();
    s = scansReducer({ scans: [{ id: 'x' }], selectedId: 'x' }, { type: 'CLEAR' });
    expect(s.scans).toEqual([]);
  });
});

describe('App integration (routing + CRUD + search)', () => {
  it('adds an entry manually, finds it in History, edits and deletes it', async () => {
    const user = userEvent.setup();
    renderApp('/');

    // CREATE via manual form
    await user.type(await screen.findByLabelText(/QR content/i), 'https://pccoe.edu.in');
    await user.type(screen.getByLabelText(/^Label/i), 'College');
    await user.click(screen.getByRole('button', { name: /save entry/i }));
    expect(await screen.findByTestId('result-value')).toHaveTextContent('https://pccoe.edu.in');

    // ROUTING -> History
    await user.click(screen.getByRole('link', { name: /history/i }));
    expect(await screen.findByRole('heading', { name: /scan history/i })).toBeInTheDocument();
    expect(screen.getByText('College')).toBeInTheDocument();

    // SEARCH
    await user.type(screen.getByLabelText(/search history/i), 'zzz-no-match');
    expect(await screen.findByText(/No scans match/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /reset/i }));
    expect(await screen.findByText('College')).toBeInTheDocument();

    // READ detail + UPDATE
    await user.click(screen.getByLabelText('Open College'));
    expect(await screen.findByRole('heading', { name: /scan details/i })).toBeInTheDocument();
    const label = screen.getByLabelText(/Label/i);
    await user.clear(label);
    await user.type(label, 'PCCoE Site');
    await user.click(screen.getByRole('button', { name: /save changes/i }));
    expect(await screen.findByText('Changes saved')).toBeInTheDocument();

    // DELETE
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await user.click(screen.getByRole('button', { name: /delete/i }));
    expect(await screen.findByText(/No scans yet/i)).toBeInTheDocument();
  });

  it('shows 404 page for unknown routes and offline banner', async () => {
    renderApp('/does-not-exist');
    expect(await screen.findByText(/404/)).toBeInTheDocument();
    expect(await screen.findByText(/Offline mode/i)).toBeInTheDocument();
  });
});
