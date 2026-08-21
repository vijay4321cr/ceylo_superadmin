"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/banners
 *   POST /admin/banners
 */
export default function Page() {
  return (
    <ComingSoon
      title="Banners"
      subtitle="Promotional placements across the consumer app."
      purpose="Schedule promotional placements and track how they perform."
      columns={["Banner","Placement","Vertical","Runs","Impressions","CTR","Status"]}
    />
  );
}
