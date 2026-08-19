"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

export default function Page() {
  return (
    <ComingSoon
      title="Settlements"
      purpose="Generate and approve settlement runs — gross, commission, WHT and net payable per partner."
      endpoints={["GET /admin/finance/settlements","POST /admin/finance/settlements/generate","POST /admin/finance/settlements/:id/approve"]}
    />
  );
}
