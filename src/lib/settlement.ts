/**
 * Settlement maths — the ONE implementation.
 *
 * The partner dashboard's statement and the admin console's settlement run
 * both call this, so the two surfaces can never disagree about what a partner
 * is owed. `gross → commission → WHT = net payable`.
 *
 * All amounts are LKR cents. Rounding is half-up at each deduction, so the
 * sum of the lines always equals the run total exactly.
 */

import type { SettlementLine } from "./types";

export type Rates = { commissionPct: number; whtPct: number };

export function commissionOn(grossCents: number, commissionPct: number): number {
  return Math.round((grossCents * commissionPct) / 100);
}

/**
 * WHT is deducted at source on the *commission* — the fee Ceylo charges for a
 * service — not on the partner's gross takings.
 */
export function whtOn(commissionCents: number, whtPct: number): number {
  return Math.round((commissionCents * whtPct) / 100);
}

export function settleLine(
  grossCents: number,
  rates: Rates,
): { commissionCents: number; whtCents: number; netCents: number } {
  const commissionCents = commissionOn(grossCents, rates.commissionPct);
  const whtCents = whtOn(commissionCents, rates.whtPct);
  // The partner receives gross less commission, plus back the WHT that Ceylo
  // remits to the Inland Revenue on the partner's behalf.
  const netCents = grossCents - commissionCents + whtCents;
  return { commissionCents, whtCents, netCents };
}

export function totalise(lines: SettlementLine[]) {
  return lines.reduce(
    (acc, l) => ({
      grossCents: acc.grossCents + l.grossCents,
      commissionCents: acc.commissionCents + l.commissionCents,
      whtCents: acc.whtCents + l.whtCents,
      netCents: acc.netCents + l.netCents,
    }),
    { grossCents: 0, commissionCents: 0, whtCents: 0, netCents: 0 },
  );
}

/** Builds a fully-costed line from a booking's gross value. */
export function buildLine(
  bookingId: string,
  vertical: SettlementLine["vertical"],
  date: string,
  grossCents: number,
  rates: Rates,
): SettlementLine {
  const { commissionCents, whtCents, netCents } = settleLine(grossCents, rates);
  return { bookingId, vertical, date, grossCents, commissionCents, whtCents, netCents };
}

export const CYCLE_DAYS: Record<"weekly" | "fortnightly" | "monthly", number> = {
  weekly: 7,
  fortnightly: 14,
  monthly: 30,
};
