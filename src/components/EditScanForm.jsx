import { useState } from 'react';
import { hasErrors, LIMITS, validateScanMeta } from '../utils/validators';

/** Update form (label + notes) with inline validation. */
export default function EditScanForm({ scan, onSave }) {
  const [form, setForm] = useState({ label: scan.label || '', notes: scan.notes || '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);

  const change = (e) => {
    const next = { ...form, [e.target.name]: e.target.value };
    setForm(next);
    if (touched) setErrors(validateScanMeta(next));
  };

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    const found = validateScanMeta(form);
    setErrors(found);
    if (hasErrors(found)) return;
    onSave({ label: form.label.trim(), notes: form.notes.trim() });
  };

  return (
    <form onSubmit={submit} noValidate className="form" aria-label="Edit scan">
      <label htmlFor="e-label">Label *</label>
      <input id="e-label" name="label" type="text" value={form.label} onChange={change}
        aria-invalid={!!errors.label} aria-describedby="e-label-err" />
      <span id="e-label-err" className="field-error">{errors.label}</span>

      <label htmlFor="e-notes">Notes</label>
      <textarea id="e-notes" name="notes" rows="3" value={form.notes} onChange={change}
        aria-invalid={!!errors.notes} aria-describedby="e-notes-err" />
      <div className="field-foot">
        <span id="e-notes-err" className="field-error">{errors.notes}</span>
        <span className="muted small">{form.notes.length}/{LIMITS.notes}</span>
      </div>

      <button type="submit" className="btn primary">Save Changes</button>
    </form>
  );
}
