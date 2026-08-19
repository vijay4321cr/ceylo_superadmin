"use client";

import { Construction, Plug } from "lucide-react";
import { PageHead } from "@/components/admin/StaffShell";

/**
 * Shown wherever the UI exists but the API does not.
 *
 * This console deliberately displays **no invented data**. A screen with no
 * endpoint behind it says so and lists what the backend would need to expose,
 * so the gap is a work item rather than a mystery.
 */
export function ComingSoon({
  title,
  subtitle,
  purpose,
  endpoints,
}: {
  title: string;
  subtitle?: string;
  /** One line on what this screen is for once it is connected. */
  purpose: string;
  /** The endpoints this screen needs, written as they would be called. */
  endpoints: string[];
}) {
  return (
    <>
      <PageHead title={title} subtitle={subtitle} />

      <div className="mx-auto max-w-xl rounded-tile border border-line bg-paper p-6 shadow-tile">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-peach-tint">
          <Construction className="size-5 text-peach" aria-hidden />
        </span>

        <h2 className="mt-3 font-display text-base font-semibold text-ink">Not connected yet</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{purpose}</p>
        <p className="mt-2 text-[12px] leading-relaxed text-ink-mute">
          The Ceylo backend does not expose an endpoint for this yet, so there is nothing real to
          show. Rather than fill the screen with sample figures, it stays empty until the API lands.
        </p>

        <div className="mt-4 rounded-tile border border-line bg-sand-soft/60 p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-mute">
            <Plug className="size-3" aria-hidden />
            Needs from the API
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {endpoints.map((e) => (
              <li key={e} className="font-mono text-[11px] text-ink-soft">
                {e}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
