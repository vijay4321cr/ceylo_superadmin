/**
 * Chart colour — VALIDATED, do not eyeball changes.
 *
 * These are chart *steps*, not the raw brand tokens. The brand coral/violet/sky
 * are tuned for large UI surfaces and are too light to carry a thin 2px line or
 * clear 3:1 against the cream chart surface. Each step below is the nearest
 * darker step of the same hue that passes.
 *
 * Validated with the data-viz palette validator against surface #faf7f0:
 *
 *   categorical, adjacent pairs (bars, stacks, lines) — 4 slots: ALL PASS
 *     lightness band · chroma floor · CVD ΔE 11.6 (deutan) · normal ΔE 17.3 · contrast ≥3:1
 *   categorical, ALL pairs (scatter, bubble, choropleth) — 3 slots: ALL PASS
 *     CVD ΔE 11.6 · normal ΔE 17.3
 *   ordinal ramp (funnel stages) — 5 steps: ALL PASS
 *     monotone L · ΔL gaps ≥0.06 · light end 2.26:1
 *
 * SERIES CAP: all-pairs forms (scatter, choropleth) use at most the three
 * vertical slots. That is not a limitation in practice — Ceylo has exactly
 * three verticals. A fourth series in such a form folds into "Other" or becomes
 * small multiples. If you ever need a fifth categorical series, re-run
 * `scripts/validate_palette.js` on the candidate ordering; do not invent a hue.
 *
 * The Ceylo surface is cream in every context — the product deliberately does
 * not ship a dark theme — so a single committed set of steps is correct here.
 */

import type { Vertical } from "./types";

/** The chart surface these steps were validated against. */
export const CHART_SURFACE = "#faf7f0";

/** Fixed slot order. Never cycled, never reassigned by rank. */
export const SERIES = [
  "#d94a2f", // 1 · coral step — Dining
  "#2b7fb0", // 2 · sky step   — Ferries
  "#6242d9", // 3 · violet step— Events
  "#1a8a5f", // 4 · green step — Total / Other (adjacent-pair forms only)
] as const;

/**
 * Colour follows the entity, not its rank — filtering the vertical list must
 * never repaint the survivors, so verticals map to a fixed hue.
 */
export const VERTICAL_SERIES: Record<Vertical, string> = {
  dining: SERIES[0],
  ferry: SERIES[1],
  event: SERIES[2],
};

export const SERIES_TOTAL = SERIES[3];

/** Single-hue ordinal ramp, light→dark. Funnel stages, tiers, heat cells. */
export const ORDINAL = ["#7cadca", "#4d94bd", "#2b7fb0", "#1f6088", "#14425c"] as const;

/**
 * Status colours are RESERVED. They never stand in for "series 5", and they
 * always ship with a label or icon beside them — never colour alone.
 */
export const STATUS = {
  good: "#2f8f5b",
  warning: "#b26a00",
  serious: "#c4472c",
  critical: "#a01f14",
} as const;

/** Recessive chart furniture — grid and axes sit behind the data, not beside it. */
export const AXIS = {
  grid: "#e2dccb",
  tick: "#6f6f61",
  label: "#3d3d33",
  surface: CHART_SURFACE,
};

/** Shared Recharts props so every chart in the console reads as one system. */
export const axisProps = {
  stroke: AXIS.tick,
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

export const gridProps = {
  stroke: AXIS.grid,
  strokeDasharray: "0",
  vertical: false,
} as const;
