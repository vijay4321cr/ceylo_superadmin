"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/analytics/cohorts
 */
export default function Page() {
  return (
    <ComingSoon
      title="Partner cohorts"
      subtitle="Partners still transacting N months after joining."
      purpose="See retention by joining month."
      columns={["Cohort","Partners","M0","M1","M2","M3"]}
    />
  );
}
