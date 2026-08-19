"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

type Toast = { id: number; kind: "ok" | "error" | "info"; message: string };

let seq = 0;
const listeners = new Set<(t: Toast[]) => void>();
let queue: Toast[] = [];

function emit() {
  for (const l of listeners) l([...queue]);
}

/** Fire-and-forget notice. Importable from anywhere, no provider needed. */
export function toast(message: string, kind: Toast["kind"] = "ok") {
  const t = { id: ++seq, kind, message };
  queue = [...queue, t];
  emit();
  setTimeout(() => {
    queue = queue.filter((x) => x.id !== t.id);
    emit();
  }, 4200);
}

export function ToastHost() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.add(setItems);
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  if (!items.length) return null;

  const icons = {
    ok: <CheckCircle2 className="size-4 text-ok" aria-hidden />,
    error: <AlertTriangle className="size-4 text-danger" aria-hidden />,
    info: <Info className="size-4 text-sky" aria-hidden />,
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end"
    >
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            "anim-rise pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-tile border bg-paper px-3.5 py-2.5 shadow-pop",
            t.kind === "error" ? "border-danger/40" : "border-line",
          )}
        >
          {icons[t.kind]}
          <p className="flex-1 text-sm text-ink">{t.message}</p>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => {
              queue = queue.filter((x) => x.id !== t.id);
              emit();
            }}
            className="text-ink-faint hover:text-ink"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
