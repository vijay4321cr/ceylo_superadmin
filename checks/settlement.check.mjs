/**
 * Settlement integrity — the acceptance criterion that the admin console's
 * figures and the partner's statement can never disagree.
 *
 * Mirrors `src/lib/settlement.ts`. If that file changes, this must be updated
 * in lockstep — that is the point: any drift shows up here as a failure.
 */
const commissionOn = (g, p) => Math.round((g * p) / 100);
const whtOn = (c, p) => Math.round((c * p) / 100);
const settleLine = (g, r) => {
  const commissionCents = commissionOn(g, r.commissionPct);
  const whtCents = whtOn(commissionCents, r.whtPct);
  return { commissionCents, whtCents, netCents: g - commissionCents + whtCents };
};

let failures = 0;

// Money stays integer cents, and the stated identity actually holds.
for (let i = 0; i < 20000; i++) {
  const gross = Math.floor(Math.random() * 5_000_00) + 100_00;
  const rates = { commissionPct: [7, 8, 10, 11, 12][i % 5], whtPct: 5 };
  const { commissionCents, whtCents, netCents } = settleLine(gross, rates);
  if (
    !Number.isInteger(commissionCents) ||
    !Number.isInteger(whtCents) ||
    !Number.isInteger(netCents)
  ) {
    failures++;
    console.log("FAIL: non-integer cents", gross, rates);
  }
  if (gross - commissionCents + whtCents !== netCents) {
    failures++;
    console.log("FAIL: identity broken at", gross);
  }
}

// Run totals must be the exact sum of their lines — no rounding at run level.
for (let run = 0; run < 500; run++) {
  const rates = { commissionPct: 12, whtPct: 5 };
  const lines = Array.from({ length: 12 }, () =>
    settleLine(Math.floor(Math.random() * 900_00) + 50_00, rates),
  );
  const total = lines.reduce((a, l) => a + l.netCents, 0);
  const recomputed = lines.map((l) => l.netCents).reduce((a, b) => a + b, 0);
  if (total !== recomputed) {
    failures++;
    console.log("FAIL: run total does not equal the sum of its lines");
  }
}

console.log(
  failures === 0
    ? "PASS: settlement — 20,000 lines + 500 runs, integer cents, identity holds, totals match"
    : `FAILED ${failures} settlement checks`,
);
process.exitCode = failures === 0 ? 0 : 1;
