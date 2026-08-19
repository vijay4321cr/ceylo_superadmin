"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

export default function Page() {
  return (
    <ComingSoon
      title="Campaigns"
      purpose="Build and send push, SMS and email campaigns to an audience segment."
      endpoints={["GET /admin/campaigns","POST /admin/campaigns","GET /admin/segments"]}
    />
  );
}
