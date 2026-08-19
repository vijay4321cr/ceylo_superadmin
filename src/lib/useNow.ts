"use client";

import { useState } from "react";

/**
 * "Now", captured once when the component mounts.
 *
 * Reading `Date.now()` during render is impure — it can produce a different
 * answer on every re-render. Anything comparing a date against the present
 * (expiry checks, SLA ages) reads this instead, so a render is idempotent.
 * Day-granularity comparisons do not care that the value is a few minutes
 * stale, and a route change remounts it.
 */
export function useNow(): number {
  const [now] = useState(() => Date.now());
  return now;
}
