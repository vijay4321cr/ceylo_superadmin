"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

/** Route-level error boundary. Every screen ships one, per §14. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Against a real backend this is where the error reporter would be called.
    console.error(error);
  }, [error]);

  return (
    <div className="grid flex-1 place-items-center bg-cream px-4 py-16">
      <div className="w-full max-w-sm rounded-tile border border-line bg-paper p-6 text-center shadow-tile">
        <AlertTriangle className="mx-auto size-8 text-coral" aria-hidden />
        <h1 className="mt-3 font-display text-lg font-semibold text-ink">Something went wrong</h1>
        <p className="mt-1.5 text-sm text-ink-mute">
          The screen failed to load. Nothing you entered has been lost — drafts save as you type.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-[10px] text-ink-faint">Reference {error.digest}</p>
        )}
        <button
          type="button"
          onClick={reset}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-chip bg-ink px-4 text-sm font-semibold text-cream hover:bg-ink-soft"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
