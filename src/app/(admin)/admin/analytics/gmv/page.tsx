"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/analytics/gmv
 */
export default function Page() {
  return (
    <ComingSoon
      title="GMV"
      subtitle="Gross merchandise value by month, vertical and district."
      purpose="Track GMV across the marketplace."
      stats={["This month","Dining","Ferries","Events"]}
    />
  );
}
