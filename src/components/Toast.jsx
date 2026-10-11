import { useEffect } from 'react';

/** Transient notification. Auto-dismisses using useEffect + timer cleanup. */
export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(onClose, 2600);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  return (
    <div className={`toast ${toast.kind}`} role="status" aria-live="polite">
      {toast.message}
    </div>
  );
}
