export const LIMITS = { value: 2000, label: 40, notes: 200, fileMB: 8 };

/** Validation for the "Add manually" form. Returns { field: message } (empty = valid). */
export function validateManualEntry({ value = '', label = '' }) {
  const errors = {};
  const v = value.trim();
  if (!v) errors.value = 'QR content is required.';
  else if (v.length > LIMITS.value) errors.value = `Content must be at most ${LIMITS.value} characters.`;
  if (label.trim().length > LIMITS.label) errors.label = `Label must be at most ${LIMITS.label} characters.`;
  return errors;
}

/** Validation for the edit-scan form (label + notes). */
export function validateScanMeta({ label = '', notes = '' }) {
  const errors = {};
  const l = label.trim();
  if (!l) errors.label = 'Label is required.';
  else if (l.length < 2) errors.label = 'Label must be at least 2 characters.';
  else if (l.length > LIMITS.label) errors.label = `Label must be at most ${LIMITS.label} characters.`;
  if (notes.length > LIMITS.notes) errors.notes = `Notes must be at most ${LIMITS.notes} characters.`;
  return errors;
}

/** Validates an uploaded image file before decoding. Returns an error string or ''. */
export function validateImageFile(file) {
  if (!file) return 'No file selected.';
  if (!file.type || !file.type.startsWith('image/')) return 'Please choose an image file (PNG, JPG, WEBP...).';
  if (file.size > LIMITS.fileMB * 1024 * 1024) return `Image is too large (max ${LIMITS.fileMB} MB).`;
  return '';
}

export const hasErrors = (errors) => Object.keys(errors).length > 0;
