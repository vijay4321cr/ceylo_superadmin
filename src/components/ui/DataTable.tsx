"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { EmptyState, LoadingRows } from "./Tile";

export type Column<T> = {
  key: string;
  header: string;
  /** Cell renderer. Keep it cheap — these tables get long. */
  cell: (row: T) => ReactNode;
  /** Return a comparable value to make the column sortable. */
  sortValue?: (row: T) => string | number;
  width?: string;
  align?: "left" | "right";
  hideBelow?: "sm" | "md" | "lg";
};

/**
 * The admin console's workhorse. Dense by default — staff scan these all day.
 * Sorting is client-side because the whole dataset is already in memory.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  loading,
  emptyTitle = "Nothing here",
  emptyBody,
  defaultSort,
  defaultDir = "asc",
  selectedKey,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyTitle?: string;
  emptyBody?: string;
  defaultSort?: string;
  defaultDir?: "asc" | "desc";
  selectedKey?: string;
}) {
  const [sortKey, setSortKey] = useState<string | undefined>(defaultSort);
  const [dir, setDir] = useState<"asc" | "desc">(defaultDir);

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av === bv) return 0;
      const cmp = av < bv ? -1 : 1;
      return dir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, columns, sortKey, dir]);

  function toggle(key: string) {
    if (sortKey === key) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setDir("asc");
    }
  }

  if (loading) return <LoadingRows rows={6} />;
  if (!rows.length) return <EmptyState title={emptyTitle} body={emptyBody} />;

  const hide: Record<string, string> = {
    sm: "hidden sm:table-cell",
    md: "hidden md:table-cell",
    lg: "hidden lg:table-cell",
  };

  return (
    <div className="overflow-x-auto rounded-tile border border-line bg-paper shadow-tile scroll-thin">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-line bg-sand-soft/60">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                style={c.width ? { width: c.width } : undefined}
                className={cn(
                  "px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-mute",
                  c.align === "right" && "text-right",
                  c.hideBelow && hide[c.hideBelow],
                )}
              >
                {c.sortValue ? (
                  <button
                    type="button"
                    onClick={() => toggle(c.key)}
                    className={cn(
                      "inline-flex items-center gap-1 hover:text-ink",
                      c.align === "right" && "flex-row-reverse",
                    )}
                    aria-label={`Sort by ${c.header}`}
                  >
                    {c.header}
                    {sortKey === c.key ? (
                      dir === "asc" ? (
                        <ChevronUp className="size-3" aria-hidden />
                      ) : (
                        <ChevronDown className="size-3" aria-hidden />
                      )
                    ) : (
                      <ChevronsUpDown className="size-3 opacity-40" aria-hidden />
                    )}
                  </button>
                ) : (
                  c.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const key = rowKey(row);
            const selected = selectedKey === key;
            return (
              <tr
                key={key}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                className={cn(
                  "border-b border-line-soft last:border-0",
                  onRowClick && "cursor-pointer hover:bg-cream-deep/60",
                  selected && "bg-lime-tint/50",
                )}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      "px-3 py-2.5 align-middle text-ink",
                      c.align === "right" && "text-right tabular-nums",
                      c.hideBelow && hide[c.hideBelow],
                    )}
                  >
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Filter bar that sits above a DataTable. */
export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-end gap-2 rounded-tile border border-line bg-paper p-3 shadow-tile">
      {children}
    </div>
  );
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-mute">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 min-w-32 rounded-chip border border-line bg-paper px-2 text-xs text-ink focus:border-ink focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1", className)}>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-mute">Search</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 w-full min-w-48 rounded-chip border border-line bg-paper px-3 text-xs text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
      />
    </label>
  );
}
