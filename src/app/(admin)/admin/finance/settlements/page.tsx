"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/finance/settlements
 *   POST /admin/finance/settlements/generate
 *   POST /admin/finance/settlements/:id/approve
 */
export default function Page() {
  return (
    <ComingSoon
      title="Settlements"
      subtitle="gross − commission + WHT = net payable, matching what the partner sees."
      purpose="Generate and approve settlement runs per partner."
      actionLabel="Generate run"
      stats={["Drafts awaiting approval","Approved, not yet paid","Total net this view"]}
      filters={[{"label":"Status","options":["All"]}]}
      columns={["Partner","Period","Cycle","Gross","Commission","WHT","Net payable","Status"]}
    />
  );
}
