"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

export default function Page() {
  return (
    <ComingSoon
      title="Audit logs"
      purpose="Filterable record of every staff and partner mutation, with before and after values."
      endpoints={["GET /admin/audit-logs"]}
    />
  );
}
