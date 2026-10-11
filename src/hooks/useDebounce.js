import { useEffect, useState } from 'react';

/** Returns `value` only after it has stopped changing for `delay` ms (used for search). */
export default function useDebounce(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
