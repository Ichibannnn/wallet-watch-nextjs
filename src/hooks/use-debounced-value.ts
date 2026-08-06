"use client";

import { useEffect, useState } from "react";

/**
 * Returns a copy of `value` that only updates after it has stopped changing for
 * `delay` ms. Used to keep a search box responsive while throttling the API
 * calls it triggers.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
