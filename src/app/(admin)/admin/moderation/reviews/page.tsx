"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/reviews/moderation
 *   POST /admin/reviews/:id/approve
 *   POST /admin/reviews/:id/reject
 */
export default function Page() {
  return (
    <ComingSoon
      title="Review moderation"
      subtitle="Customer reviews reported by partners or caught by the filter."
      purpose="Decide on reported and auto-flagged customer reviews."
      filters={[{"label":"Status","options":["Pending"]}]}
      columns={["Review","Partner","Rating","Submitted","Status",""]}
    />
  );
}
