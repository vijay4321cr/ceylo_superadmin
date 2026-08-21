"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/finance/payouts
 *   POST /admin/finance/payouts/:id/paid
 *   POST /admin/finance/payouts/:id/retry
 */
export default function Page() {
  return <ComingSoon title="Payouts" purpose="Track payout batches, capture the bank transfer reference, and retry failures." />;
}
