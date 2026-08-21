"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/listings/moderation
 *   POST /admin/listings/:id/approve
 *   POST /admin/listings/:id/reject
 */
export default function Page() {
  return (
    <ComingSoon
      title="Listing moderation"
      subtitle="Partner changes to what customers see, before they go live."
      purpose="Review listing changes — photos, prices, descriptions, routes."
      filters={[{"label":"Status","options":["Pending"]}]}
      columns={["Listing","Partner","Summary","Submitted","Status",""]}
    />
  );
}
