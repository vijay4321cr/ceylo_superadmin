"use client";

import { cn } from "@/lib/cn";

/**
 * The status → tint map from §4. Extended beyond application status so the
 * admin console can badge payouts, moderation and tickets with the same
 * vocabulary of colour.
 */
const TINTS: Record<string, string> = {
  // application lifecycle
  draft: "bg-sand text-ink-soft border-sand",
  submitted: "bg-peach-tint text-ink border-peach/40",
  under_review: "bg-sky-tint text-ink border-sky/40",
  changes_requested: "bg-coral-tint text-ink border-coral/40",
  approved: "bg-lime-tint text-ink border-lime-deep/40",
  live: "bg-ink text-lime border-ink",
  paused: "bg-coral-tint text-ink border-coral/40",
  suspended: "bg-coral-tint text-ink border-coral/40",

  // documents
  missing: "bg-sand text-ink-mute border-sand",
  pending: "bg-peach-tint text-ink border-peach/40",
  verified: "bg-lime-tint text-ink border-lime-deep/40",
  rejected: "bg-coral-tint text-ink border-coral/40",
  lapsed: "bg-danger-tint text-ink border-danger/40",
  expiring: "bg-peach-tint text-ink border-peach/50",

  // money
  paid: "bg-lime-tint text-ink border-lime-deep/40",
  queued: "bg-sky-tint text-ink border-sky/40",
  processing: "bg-sky-tint text-ink border-sky/40",
  failed: "bg-danger-tint text-ink border-danger/40",
  on_hold: "bg-peach-tint text-ink border-peach/40",
  requested: "bg-peach-tint text-ink border-peach/40",
  processed: "bg-lime-tint text-ink border-lime-deep/40",

  // tickets / staff / generic
  open: "bg-sky-tint text-ink border-sky/40",
  resolved: "bg-lime-tint text-ink border-lime-deep/40",
  closed: "bg-sand text-ink-mute border-sand",
  active: "bg-lime-tint text-ink border-lime-deep/40",
  invited: "bg-peach-tint text-ink border-peach/40",
  disabled: "bg-sand text-ink-mute border-sand",
  scheduled: "bg-sky-tint text-ink border-sky/40",
  expired: "bg-sand text-ink-mute border-sand",
  ended: "bg-sand text-ink-mute border-sand",
  sent: "bg-lime-tint text-ink border-lime-deep/40",
  cleared: "bg-lime-tint text-ink border-lime-deep/40",
  actioned: "bg-sky-tint text-ink border-sky/40",
  onboarding: "bg-peach-tint text-ink border-peach/40",

  // severity / priority
  low: "bg-sand text-ink-mute border-sand",
  normal: "bg-sky-tint text-ink border-sky/40",
  medium: "bg-peach-tint text-ink border-peach/40",
  high: "bg-coral-tint text-ink border-coral/40",
  urgent: "bg-danger-tint text-ink border-danger/40",
};

const LABELS: Record<string, string> = {
  under_review: "Under review",
  changes_requested: "Changes requested",
  on_hold: "On hold",
  super_admin: "Super Admin",
};

export function StatusBadge({
  status,
  label,
  className,
  dot = false,
}: {
  status: string;
  /** Override the auto label — the onboarding surface passes a translated one. */
  label?: string;
  className?: string;
  dot?: boolean;
}) {
  const text =
    label ??
    LABELS[status] ??
    status.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-chip border px-2 py-0.5 text-xs font-medium",
        TINTS[status] ?? "bg-sand text-ink-soft border-sand",
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />}
      {text}
    </span>
  );
}

/** Dining coral · Events violet · Ferries sky — unchanged across surfaces. */
export const VERTICAL_TINT: Record<string, string> = {
  dining: "bg-coral-tint text-ink border-coral/40",
  event: "bg-violet-tint text-ink border-violet/40",
  ferry: "bg-sky-tint text-ink border-sky/40",
};

export const VERTICAL_LABEL: Record<string, string> = {
  dining: "Dining",
  event: "Events",
  ferry: "Ferries",
};

export const VERTICAL_ACCENT: Record<string, string> = {
  dining: "coral",
  event: "violet",
  ferry: "sky",
};

export function VerticalBadge({ vertical, className }: { vertical: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-chip border px-2 py-0.5 text-xs font-medium",
        VERTICAL_TINT[vertical] ?? "bg-sand text-ink-soft border-sand",
        className,
      )}
    >
      {VERTICAL_LABEL[vertical] ?? vertical}
    </span>
  );
}
