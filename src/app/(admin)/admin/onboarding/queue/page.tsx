"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

export default function Page() {
  return (
    <ComingSoon
      title="Application queue"
      purpose="Applications submitted through the Ceylo onboarding wizard, before KYC review."
      endpoints={["GET /admin/applications","GET /admin/applications/:id","POST /admin/applications/:id/decision"]}
    />
  );
}
