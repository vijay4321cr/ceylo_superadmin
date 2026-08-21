"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/tickets
 *   GET /admin/tickets/:id
 *   POST /admin/tickets/:id/reply
 *   PATCH /admin/tickets/:id
 */
export default function Page() {
  return (
    <ComingSoon
      title="Support tickets"
      subtitle="Partner and customer conversations in one queue."
      purpose="Work partner and customer tickets, with booking interventions attached."
      stats={["Open","Urgent","All in view"]}
      search="Subject or requester"
      filters={[{"label":"Status","options":["All"]},{"label":"From","options":["Everyone"]}]}
      columns={["Subject","Priority","Status","Booking","Updated"]}
    />
  );
}
