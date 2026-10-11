import { useState } from 'react';
import { hasErrors, LIMITS, validateManualEntry } from '../utils/validators';

/** Controlled form with validation: lets the user add QR content by typing/pasting it (Create). */
export default function ManualEntryForm({ onSubmit }) {
  const [form, setForm] = useState({ value: '', label: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);

  const change = (e) => {
    const next = { ...form, [e.target.name]: e.target.value };
    setForm(next);
    if (touched) setErrors(validateManualEntry(next));
  };

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    const found = validateManualEntry(form);
    setErrors(found);
    if (hasErrors(found)) return;
    const ok = await onSubmit(form.value.trim(), form.label.trim());
    if (ok) {
      setForm({ value: '', label: '' });
      setTouched(false);
      setErrors({});
    }
  };

  return (
    <section className="card" aria-label="Add manually">
      <h2>Add Entry Manually</h2>
      <form onSubmit={submit} noValidate className="form">
        <label htmlFor="m-value">QR content *</label>
        <textarea
          id="m-value" name="value" rows="3" value={form.value} onChange={change}
          placeholder="Paste a URL, text, Wi-Fi string…"
          aria-invalid={!!errors.value} aria-describedby="m-value-err"
        />
        <div className="field-foot">
          <span id="m-value-err" className="field-error">{errors.value}</span>
          <span className="muted small">{form.value.length}/{LIMITS.value}</span>
        </div>

        <label htmlFor="m-label">Label (optional)</label>
        <input
          id="m-label" name="label" type="text" value={form.label} onChange={change}
          placeholder="e.g. Event ticket" aria-invalid={!!errors.label} aria-describedby="m-label-err"
        />
        <span id="m-label-err" className="field-error">{errors.label}</span>

        <button type="submit" className="btn primary">＋ Save Entry</button>
      </form>
    </section>
  );
}
