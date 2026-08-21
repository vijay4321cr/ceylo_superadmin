"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/applications
 *   GET /admin/applications/:id
 *   POST /admin/applications/:id/decision
 */
export default function Page() {
  return (
    <ComingSoon
      title="Application queue"
      subtitle="Oldest first — SLA is what matters."
      purpose="Review applications submitted through the Ceylo onboarding wizard."
      stats={["Open","Past SLA","Unassigned"]}
      search="Business, contact or app id"
      filters={[{"label":"Status","options":["All statuses"]},{"label":"Vertical","options":["All verticals"]},{"label":"District","options":["All districts"]},{"label":"Reviewer","options":["Anyone"]}]}
      columns={["Applicant","Vertical","District","Status","Complete","Age in queue","Reviewer"]}
    />
  );
}
