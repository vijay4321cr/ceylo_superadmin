"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/partners
 *   GET /admin/partners/:id
 *   PATCH /admin/partners/:id/status
 */
export default function Page() {
  return (
    <ComingSoon
      title="Partners"
      subtitle="Every business on Ceylo, with the state of each vertical they hold."
      purpose="Browse the partner directory, and suspend or reactivate accounts."
      search="Business or legal name"
      filters={[{"label":"Account","options":["All"]},{"label":"Vertical","options":["All verticals"]},{"label":"District","options":["All districts"]}]}
      columns={["Partner","Verticals","Account","Health","GMV","Bookings 30d","Joined"]}
    />
  );
}
