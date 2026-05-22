import { useState, useEffect } from 'react';

/**
 * Debounce a fast-changing value.
 * Returns the debounced value that only updates after `delay` ms of inactivity.
 *
 * @param {*}      value - The value to debounce (string, object, etc.)
 * @param {number} delay - Debounce delay in milliseconds (default 400ms)
 * @returns {*}    The debounced value
 */
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
