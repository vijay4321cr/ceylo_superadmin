/**
 * The only money/date/number helper in the codebase. Money is LKR cents.
 * There is deliberately no second currency helper — add locales here.
 */

import type { Locale } from "./types";
import { TIMEZONE } from "./srilanka";

const LOCALE_TAG: Record<Locale, string> = {
  en: "en-LK",
  si: "si-LK",
  ta: "ta-LK",
};

function tag(locale: Locale = "en") {
  return LOCALE_TAG[locale] ?? "en-LK";
}

/** Rs 12,450.00 — full precision, for statements and invoices. */
export function money(cents: number, locale: Locale = "en"): string {
  return new Intl.NumberFormat(tag(locale), {
    style: "currency",
    currency: "LKR",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
  })
    .format(cents / 100)
    .replace(/^LKR\s?/, "Rs ");
}

/** Rs 12,450 — no cents, for tables and tiles where precision is noise. */
export function moneyShort(cents: number, locale: Locale = "en"): string {
  return new Intl.NumberFormat(tag(locale), {
    style: "currency",
    currency: "LKR",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  })
    .format(cents / 100)
    .replace(/^LKR\s?/, "Rs ");
}

/** Rs 1.2M / Rs 340K — for chart axes and GMV headlines. */
export function moneyCompact(cents: number, locale: Locale = "en"): string {
  const v = cents / 100;
  const fmt = (n: number, suffix: string) =>
    `Rs ${new Intl.NumberFormat(tag(locale), { maximumFractionDigits: 1 }).format(n)}${suffix}`;
  if (Math.abs(v) >= 1_000_000) return fmt(v / 1_000_000, "M");
  if (Math.abs(v) >= 1_000) return fmt(v / 1_000, "K");
  return fmt(v, "");
}

/** Parse a typed rupee amount into integer cents. Never returns a float. */
export function toCents(input: string | number): number {
  const n = typeof input === "number" ? input : parseFloat(String(input).replace(/[^\d.-]/g, ""));
  if (!isFinite(n)) return 0;
  return Math.round(n * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

export function num(value: number, locale: Locale = "en"): string {
  return new Intl.NumberFormat(tag(locale)).format(value);
}

export function pct(value: number, digits = 1): string {
  return `${value.toFixed(digits).replace(/\.0$/, "")}%`;
}

/* ------------------------------------------------------------------ time */

/** Every date shown to a partner is Colombo local. */
export function date(iso: string, locale: Locale = "en"): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat(tag(locale), {
    timeZone: TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function dateTime(iso: string, locale: Locale = "en"): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat(tag(locale), {
    timeZone: TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function time(iso: string, locale: Locale = "en"): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat(tag(locale), {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** "3 days ago" / "in 12 days" — used all over the Ops queue. */
export function relative(iso: string, locale: Locale = "en"): string {
  if (!iso) return "—";
  const diffMs = new Date(iso).getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat(tag(locale), { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000000],
    ["month", 2592000000],
    ["day", 86400000],
    ["hour", 3600000],
    ["minute", 60000],
  ];
  for (const [unit, ms] of units) {
    if (Math.abs(diffMs) >= ms) return rtf.format(Math.round(diffMs / ms), unit);
  }
  return rtf.format(0, "minute");
}

/** Whole days between now and an ISO date. Negative = already past. */
export function daysUntil(iso: string): number {
  if (!iso) return NaN;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

export function daysSince(iso: string): number {
  if (!iso) return NaN;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

/** yyyy-mm-dd for <input type="date">. */
export function inputDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

export function todayIso(): string {
  return new Date().toISOString();
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function titleCase(value: string): string {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
