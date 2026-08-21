"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/refunds
 *   POST /admin/refunds/:id/approve
 *   POST /admin/refunds/:id/reject
 */
export default function Page() {
  return (
    <ComingSoon
      title="Refunds"
      subtitle="Customer refunds awaiting a decision."
      purpose="Review and decide refund requests, within the limits your role allows."
      filters={[{"label":"Status","options":["All"]}]}
      columns={["Booking","Partner","Reason","Amount","Status","Requested",""]}
    />
  );
}
