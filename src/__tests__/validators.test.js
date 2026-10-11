import { validateManualEntry, validateScanMeta, validateImageFile, hasErrors } from '../utils/validators';

describe('validateManualEntry', () => {
  it('requires content', () => {
    expect(validateManualEntry({ value: '   ' }).value).toMatch(/required/i);
  });
  it('accepts valid input', () => {
    expect(hasErrors(validateManualEntry({ value: 'abc', label: 'ok' }))).toBe(false);
  });
  it('rejects too-long label', () => {
    expect(validateManualEntry({ value: 'abc', label: 'x'.repeat(41) }).label).toBeDefined();
  });
});

describe('validateScanMeta', () => {
  it('requires a label of at least 2 chars', () => {
    expect(validateScanMeta({ label: '' }).label).toBeDefined();
    expect(validateScanMeta({ label: 'a' }).label).toBeDefined();
    expect(hasErrors(validateScanMeta({ label: 'ab' }))).toBe(false);
  });
  it('limits notes length', () => {
    expect(validateScanMeta({ label: 'ab', notes: 'n'.repeat(201) }).notes).toBeDefined();
  });
});

describe('validateImageFile', () => {
  it('rejects non-images and oversized files', () => {
    expect(validateImageFile(new File(['x'], 'a.txt', { type: 'text/plain' }))).toMatch(/image/i);
    const big = new File(['x'], 'a.png', { type: 'image/png' });
    Object.defineProperty(big, 'size', { value: 9 * 1024 * 1024 });
    expect(validateImageFile(big)).toMatch(/too large/i);
  });
  it('accepts a normal image', () => {
    expect(validateImageFile(new File(['x'], 'a.png', { type: 'image/png' }))).toBe('');
  });
});
