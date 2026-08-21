"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/analytics/funnels
 */
export default function Page() {
  return (
    <ComingSoon
      title="Onboarding funnel"
      subtitle="Where applicants stop."
      purpose="See application-to-live conversion and the biggest drop-off step."
      stats={["Started","Submitted","Live","Start → live"]}
      filters={[{"label":"Vertical","options":["All verticals"]}]}
    />
  );
}
