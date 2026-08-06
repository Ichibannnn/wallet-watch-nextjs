"use client";

import { useEffect, useState } from "react";

/**
 * Tracks whether a CSS media query currently matches. Returns `false` on the
 * server and for the first client render (avoids an SSR/client mismatch), then
 * syncs to the real value after mount and on every subsequent change.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
