"use client";

import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AXIS, SERIES, axisProps, gridProps } from "@/lib/chartTheme";
import { cn } from "@/lib/cn";

export type Series = { key: string; label: string; color: string };

/* --------------------------------------------------------------- tooltip */

/** One tooltip shape for every chart, so the hover layer reads identically. */
function CeyloTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: { name?: string; dataKey?: string | number; value?: number; color?: string }[];
  label?: string | number;
  formatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-tile border border-line bg-paper px-3 py-2 shadow-pop">
      <p className="mb-1 text-xs font-semibold text-ink">{label}</p>
      <div className="flex flex-col gap-0.5">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span
              className="size-2 shrink-0 rounded-sm"
              style={{ background: p.color }}
              aria-hidden
            />
            {/* Text wears text tokens; the swatch carries identity. */}
            <span className="text-ink-mute">{p.name ?? p.dataKey}</span>
            <span className="ml-auto font-medium tabular-nums text-ink">
              {formatter ? formatter(Number(p.value)) : p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- frame */

export function ChartFrame({
  title,
  subtitle,
  series,
  children,
  height = 260,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  /** A legend is always present for ≥2 series; a single series needs none. */
  series?: Series[];
  children: ReactNode;
  height?: number;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <figure
      className={cn("rounded-tile border border-line bg-paper p-4 shadow-tile", className)}
      style={{ background: AXIS.surface }}
    >
      <figcaption className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-ink-mute">{subtitle}</p>}
        </div>
        {action}
      </figcaption>

      {series && series.length > 1 && (
        <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1">
          {series.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5 text-xs text-ink-mute">
              <span
                className="size-2.5 rounded-sm"
                style={{ background: s.color }}
                aria-hidden
              />
              {s.label}
            </li>
          ))}
        </ul>
      )}

      <div style={{ height }}>{children}</div>
    </figure>
  );
}

/* ----------------------------------------------------------------- forms */

export function TimeSeries({
  data,
  series,
  xKey,
  formatter,
  area = false,
}: {
  data: Record<string, string | number>[];
  series: Series[];
  xKey: string;
  formatter?: (v: number) => string;
  area?: boolean;
}) {
  const Root = area ? AreaChart : LineChart;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <Root data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis {...axisProps} width={56} tickFormatter={formatter} />
        <Tooltip
          content={<CeyloTooltip formatter={formatter} />}
          cursor={{ stroke: AXIS.grid, strokeWidth: 1 }}
        />
        {series.map((s) =>
          area ? (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              fill={s.color}
              fillOpacity={0.12}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: AXIS.surface }}
            />
          ) : (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: AXIS.surface }}
            />
          ),
        )}
      </Root>
    </ResponsiveContainer>
  );
}

export function Bars({
  data,
  series,
  xKey,
  formatter,
  stacked = false,
  horizontal = false,
}: {
  data: Record<string, string | number>[];
  series: Series[];
  xKey: string;
  formatter?: (v: number) => string;
  stacked?: boolean;
  horizontal?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 4, right: 12, bottom: 0, left: horizontal ? 8 : 0 }}
      >
        <CartesianGrid {...gridProps} vertical={horizontal} horizontal={!horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" {...axisProps} tickFormatter={formatter} />
            <YAxis type="category" dataKey={xKey} {...axisProps} width={120} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} {...axisProps} />
            <YAxis {...axisProps} width={56} tickFormatter={formatter} />
          </>
        )}
        <Tooltip
          content={<CeyloTooltip formatter={formatter} />}
          cursor={{ fill: "rgba(20,20,15,0.04)" }}
        />
        {series.map((s) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            fill={s.color}
            stackId={stacked ? "a" : undefined}
            // 2px surface gap between stacked segments and adjacent bars.
            stroke={AXIS.surface}
            strokeWidth={stacked ? 2 : 0}
            radius={stacked ? 0 : horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            maxBarSize={horizontal ? 18 : 34}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Ordinal funnel — stages, not categories, so it uses the single-hue ramp. */
export function Funnel({
  stages,
  formatter,
}: {
  stages: { label: string; value: number; color: string; dropOff?: number }[];
  formatter?: (v: number) => string;
}) {
  const max = Math.max(...stages.map((s) => s.value), 1);
  return (
    <ol className="flex flex-col gap-2">
      {stages.map((s, i) => (
        <li key={s.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
            <span className="font-medium text-ink">{s.label}</span>
            <span className="tabular-nums text-ink-mute">
              {formatter ? formatter(s.value) : s.value}
              {i > 0 && s.dropOff !== undefined && (
                <span className="ml-2 text-danger">−{s.dropOff}%</span>
              )}
            </span>
          </div>
          <div className="h-5 w-full overflow-hidden rounded-md bg-sand-soft">
            <div
              className="h-full rounded-md transition-all"
              style={{ width: `${(s.value / max) * 100}%`, background: s.color }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}

export { SERIES, Cell, Legend };
