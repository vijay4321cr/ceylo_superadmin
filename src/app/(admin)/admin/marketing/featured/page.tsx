"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

export default function Page() {
  return (
    <ComingSoon
      title="Featured slots"
      purpose="Sell and schedule monetised placement slots for partners."
      endpoints={["GET /admin/featured","POST /admin/featured"]}
    />
  );
}
