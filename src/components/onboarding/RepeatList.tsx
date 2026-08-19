"use client";

import type { ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useT } from "@/lib/i18n/useT";

/**
 * Add/remove rows — vessels, routes, fares, table types, ticket tiers.
 * The wizard needs this in five places; building it once keeps the setup
 * branches short enough to read.
 */
export function RepeatList<T>({
  label,
  hint,
  items,
  onChange,
  blank,
  renderRow,
  addLabel,
  min = 0,
  error,
  readOnly,
}: {
  label: string;
  hint?: string;
  items: T[];
  onChange: (items: T[]) => void;
  blank: () => T;
  renderRow: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
  addLabel?: string;
  min?: number;
  error?: string;
  readOnly?: boolean;
}) {
  const { t } = useT();

  return (
    <section className="flex flex-col gap-2">
      <div>
        <p className="text-sm font-medium text-ink-soft">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-ink-mute">{hint}</p>}
      </div>

      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-end gap-2 rounded-tile border border-line bg-paper p-3"
          >
            <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
              {renderRow(
                item,
                (patch) => {
                  const next = [...items];
                  next[i] = { ...items[i], ...patch };
                  onChange(next);
                },
                i,
              )}
            </div>
            {!readOnly && items.length > min && (
              <button
                type="button"
                onClick={() => onChange(items.filter((_, x) => x !== i))}
                aria-label={t("common.remove")}
                className="mb-1 shrink-0 rounded-chip p-2 text-ink-mute hover:bg-cream-deep hover:text-danger"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </li>
        ))}
      </ul>

      {!readOnly && (
        <button
          type="button"
          onClick={() => onChange([...items, blank()])}
          className="inline-flex h-10 items-center justify-center gap-1.5 self-start rounded-chip border border-dashed border-line bg-paper px-3.5 text-xs font-medium text-ink-soft hover:border-ink hover:text-ink"
        >
          <Plus className="size-3.5" aria-hidden />
          {addLabel ?? t("common.add")}
        </button>
      )}

      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </section>
  );
}
