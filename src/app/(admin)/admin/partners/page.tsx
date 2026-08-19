"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

export default function Page() {
  return (
    <ComingSoon
      title="Partners"
      purpose="Directory of every business on Ceylo with per-vertical status and health."
      endpoints={["GET /admin/partners","GET /admin/partners/:id","PATCH /admin/partners/:id/status"]}
    />
  );
}
