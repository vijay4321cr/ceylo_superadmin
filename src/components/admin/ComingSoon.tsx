"use client";

import { Clock } from "lucide-react";
import { PageHead } from "@/components/admin/StaffShell";
import { Stat } from "@/components/ui/Tile";
import { FilterBar } from "@/components/ui/DataTable";
import { cn } from "@/lib/cn";

export type ComingSoonFilter = { label: string; options: string[] };

/**
 * The real screen, with nothing in it.
 *
 * Rather than a generic placeholder, this renders the page as designed — its
 * own stat tiles, its own filters, its own table columns — using the same UI
 * primitives a working screen uses. Only the data is absent, because the
 * backend has none to give: every value reads "—" and the table body says so.
 *
 * That way you can see exactly what the screen will look like, and nothing on
 * it is invented.
 *
 * The endpoints each screen needs are noted in a comment at the top of the
 * page file — a note for whoever builds the API, not for the operator.
 */
export function ComingSoon({
  title,
  subtitle,
  purpose,
  stats = [],
  filters = [],
  columns = [],
  search,
  actionLabel,
}: {
  title: string;
  subtitle?: string;
  /** One line, in plain language, on what this screen will do. */
  purpose: string;
  /** The stat tiles this screen shows, by label. */
  stats?: string[];
  /** The filters this screen offers. */
  filters?: ComingSoonFilter[];
  /** The table column headers, in order. */
  columns?: string[];
  /** Placeholder for the search box, when the screen has one. */
  search?: string;
  /** The primary action in the page header, when the screen has one. */
  actionLabel?: string;
}) {
  return (
    <>
      <PageHead
        title={title}
        subtitle={subtitle}
        action={
          actionLabel ? (
            <span
              aria-disabled
              className="inline-flex h-8 cursor-not-allowed items-center rounded-chip border border-line bg-paper px-3 text-xs font-medium text-ink-faint"
            >
              {actionLabel}
            </span>
          ) : undefined
        }
      />

      <p className="mb-4 flex items-start gap-2 rounded-tile border border-line bg-sand-soft/70 px-3 py-2.5 text-[12px] leading-relaxed text-ink-soft">
        <Clock className="mt-0.5 size-3.5 shrink-0 text-ink-mute" aria-hidden />
        <span>
          <span className="font-semibold text-ink">Coming soon.</span> {purpose} The screen below is
          how it will look — it is empty because the backend has no data for it yet.
        </span>
      </p>

      {stats.length > 0 && (
        <div
          className={cn(
            "mb-4 grid gap-3 sm:grid-cols-2",
            stats.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
          )}
        >
          {stats.map((label) => (
            <Stat key={label} label={label} value="—" />
          ))}
        </div>
      )}

      {(filters.length > 0 || search) && (
        <FilterBar>
          {search && (
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-mute">
                Search
              </span>
              <input
                disabled
                placeholder={search}
                className="h-8 w-full min-w-48 cursor-not-allowed rounded-chip border border-line bg-sand-soft/60 px-3 text-xs text-ink-faint placeholder:text-ink-faint"
              />
            </label>
          )}
          {filters.map((f) => (
            <label key={f.label} className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-mute">
                {f.label}
              </span>
              <select
                disabled
                className="h-8 min-w-32 cursor-not-allowed rounded-chip border border-line bg-sand-soft/60 px-2 text-xs text-ink-faint"
              >
                <option>{f.options[0] ?? "—"}</option>
              </select>
            </label>
          ))}
        </FilterBar>
      )}

      {columns.length > 0 ? (
        <div className="overflow-x-auto rounded-tile border border-line bg-paper shadow-tile scroll-thin">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-sand-soft/60">
                {/* An empty header is the actions column, so key by position. */}
                {columns.map((c, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="whitespace-nowrap px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-mute"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} className="px-3 py-14 text-center">
                  <Clock className="mx-auto size-5 text-ink-faint" aria-hidden />
                  <p className="mt-2 font-display text-sm font-semibold text-ink">Nothing here yet</p>
                  <p className="mt-1 text-xs text-ink-mute">
                    Rows will appear once this screen is connected.
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid place-items-center rounded-tile border border-dashed border-line bg-sand-soft/40 px-6 py-16 text-center">
          <Clock className="size-5 text-ink-faint" aria-hidden />
          <p className="mt-2 font-display text-sm font-semibold text-ink">Nothing here yet</p>
          <p className="mt-1 max-w-sm text-xs text-ink-mute">
            This screen is built but not connected, so there is nothing to show.
          </p>
        </div>
      )}
    </>
  );
}
