"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Tile({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-tile border border-line bg-paper shadow-tile",
        padded && "p-4 sm:p-5",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function TileHeader({
  title,
  subtitle,
  action,
  icon,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-2.5">
        {icon && <span className="mt-0.5 text-ink-mute">{icon}</span>}
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold text-ink">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-ink-mute">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/** Headline number tile — used across the admin overview and analytics. */
export function Stat({
  label,
  value,
  delta,
  hint,
  tone = "ink",
}: {
  label: string;
  value: string;
  delta?: { value: string; up: boolean };
  hint?: string;
  tone?: "ink" | "lime" | "coral" | "sky" | "violet";
}) {
  const bar: Record<string, string> = {
    ink: "bg-ink",
    lime: "bg-lime-deep",
    coral: "bg-coral",
    sky: "bg-sky",
    violet: "bg-violet",
  };
  return (
    <div className="relative overflow-hidden rounded-tile border border-line bg-paper p-4 shadow-tile">
      <span className={cn("absolute inset-x-0 top-0 h-0.5", bar[tone])} aria-hidden />
      <p className="text-xs font-medium uppercase tracking-wide text-ink-mute">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-semibold tabular-nums text-ink">{value}</p>
      <div className="mt-1 flex items-center gap-2">
        {delta && (
          <span className={cn("text-xs font-medium", delta.up ? "text-ok" : "text-danger")}>
            {delta.up ? "▲" : "▼"} {delta.value}
          </span>
        )}
        {hint && <span className="text-xs text-ink-faint">{hint}</span>}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-tile border border-dashed border-line bg-sand-soft/50 px-6 py-12 text-center">
      {icon && <span className="text-ink-faint">{icon}</span>}
      <p className="font-display text-sm font-semibold text-ink">{title}</p>
      {body && <p className="max-w-sm text-xs text-ink-mute">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-tile", className)} aria-hidden />;
}

export function LoadingRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-tile border border-danger/30 bg-danger-tint/40 p-4 text-sm text-ink">
      <p className="font-medium">Something went wrong</p>
      <p className="mt-0.5 text-xs text-ink-soft">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-chip border border-line bg-paper px-3 py-1 text-xs font-medium hover:bg-cream-deep"
        >
          Try again
        </button>
      )}
    </div>
  );
}
