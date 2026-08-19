"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fetch-keyed-by-filters helper for the admin tables.
 *
 * Returns `null` while the current key's data is in flight — including on a
 * key change, so changing a filter shows a skeleton rather than stale rows —
 * without ever calling setState synchronously inside the effect body. That
 * last part matters: the obvious `setRows(null)` at the top of an effect
 * causes a cascading render, and React's lint rules reject it.
 *
 * The key identifies the request. The fetcher is held in a ref (synced in its
 * own effect, never written during render) so passing an inline arrow does
 * not restart the request on every render.
 */
export function useAsyncData<T>(key: string, fetcher: () => Promise<T>): T | null {
  const [entry, setEntry] = useState<{ key: string; value: T } | null>(null);
  const fetcherRef = useRef(fetcher);

  // Runs on every render, and always before the keyed effect below.
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    let cancelled = false;
    fetcherRef.current().then((value) => {
      if (!cancelled) setEntry({ key, value });
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return entry?.key === key ? entry.value : null;
}
