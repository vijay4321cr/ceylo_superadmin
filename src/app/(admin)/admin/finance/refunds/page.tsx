"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

export default function Page() {
  return (
    <ComingSoon
      title="Refunds"
      purpose="Review and decide customer refund requests within role limits."
      endpoints={["GET /admin/refunds","POST /admin/refunds/:id/approve","POST /admin/refunds/:id/reject"]}
    />
  );
}
