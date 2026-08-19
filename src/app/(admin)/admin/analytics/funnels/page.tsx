"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

export default function Page() {
  return (
    <ComingSoon
      title="Onboarding funnel"
      purpose="Application-to-live conversion and where applicants drop out."
      endpoints={["GET /admin/analytics/funnels"]}
    />
  );
}
