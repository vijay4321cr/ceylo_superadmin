"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

export default function Page() {
  return (
    <ComingSoon
      title="Support tickets"
      purpose="Work partner and customer tickets, with booking interventions attached."
      endpoints={["GET /admin/tickets","GET /admin/tickets/:id","POST /admin/tickets/:id/reply","PATCH /admin/tickets/:id"]}
    />
  );
}
