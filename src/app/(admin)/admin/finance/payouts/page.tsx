"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/finance/payouts
 *   POST /admin/finance/payouts/:id/paid
 *   POST /admin/finance/payouts/:id/retry
 */
export default function Page() {
  return (
    <ComingSoon
      title="Payouts"
      subtitle="Bank transfers out. Capture the reference against every payment."
      purpose="Track payout batches, record transfer references, and retry failures."
      stats={["Queued","Failed","Paid this view"]}
      filters={[{"label":"Status","options":["All"]}]}
      columns={["Partner","Amount","Status","Reference","Created",""]}
    />
  );
}
