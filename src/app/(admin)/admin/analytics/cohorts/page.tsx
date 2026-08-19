"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

export default function Page() {
  return (
    <ComingSoon
      title="Partner cohorts"
      purpose="Retention by joining month."
      endpoints={["GET /admin/analytics/cohorts"]}
    />
  );
}
