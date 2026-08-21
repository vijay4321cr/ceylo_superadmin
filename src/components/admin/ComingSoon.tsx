"use client";

import { Clock } from "lucide-react";
import { PageHead } from "@/components/admin/StaffShell";

/**
 * Shown wherever the screen exists but its data does not yet.
 *
 * It renders the shape of the screen — stat tiles, a filter bar, table rows —
 * greyed out behind a plain "Coming soon" message, so you can see what will be
 * here without being shown a single fabricated figure. The placeholders are
 * obviously placeholders: bars, not numbers.
 *
 * The endpoints each screen needs are recorded in a comment at the top of the
 * page file rather than on screen — that is a note for whoever builds the API,
 * not something an operator should have to read.
 */
export function ComingSoon({
  title,
  subtitle,
  purpose,
}: {
  title: string;
  subtitle?: string;
  /** One line, in plain language, on what this screen will do. */
  purpose: string;
}) {
  return (
    <>
      <PageHead title={title} subtitle={subtitle} />

      <div className="relative overflow-hidden rounded-tile border border-line bg-paper">
        {/* The shape of the screen, deliberately empty. */}
        <div aria-hidden className="pointer-events-none select-none p-4 opacity-35 blur-[1px]">
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-tile border border-line p-4">
                <div className="h-2 w-20 rounded-chip bg-sand" />
                <div className="mt-2.5 h-5 w-16 rounded-chip bg-sand-soft" />
              </div>
            ))}
          </div>

          <div className="mb-3 flex gap-2 rounded-tile border border-line p-3">
            <div className="h-7 w-40 rounded-chip bg-sand-soft" />
            <div className="h-7 w-28 rounded-chip bg-sand-soft" />
            <div className="h-7 w-28 rounded-chip bg-sand-soft" />
          </div>

          <div className="rounded-tile border border-line">
            <div className="flex gap-4 border-b border-line bg-sand-soft/60 px-3 py-2">
              {[24, 16, 20, 12].map((w, i) => (
                <div key={i} className="h-2 rounded-chip bg-sand" style={{ width: `${w * 4}px` }} />
              ))}
            </div>
            {[0, 1, 2, 3, 4].map((r) => (
              <div key={r} className="flex items-center gap-4 border-b border-line-soft px-3 py-3">
                {[28, 18, 22, 14].map((w, i) => (
                  <div
                    key={i}
                    className="h-2.5 rounded-chip bg-sand-soft"
                    style={{ width: `${w * 4}px` }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* The message that actually matters. */}
        <div className="absolute inset-0 grid place-items-center bg-paper/70 px-6">
          <div className="max-w-sm text-center">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-sand">
              <Clock className="size-5 text-ink-mute" aria-hidden />
            </span>
            <p className="mt-3 font-display text-base font-semibold text-ink">Coming soon</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{purpose}</p>
          </div>
        </div>
      </div>
    </>
  );
}
