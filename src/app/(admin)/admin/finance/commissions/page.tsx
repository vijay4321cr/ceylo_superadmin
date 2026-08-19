"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

export default function Page() {
  return (
    <ComingSoon
      title="Commissions & fees"
      purpose="Set commission, convenience fee, settlement cycle and WHT per partner, category or district."
      endpoints={["GET /admin/finance/commissions","PUT /admin/finance/commissions"]}
    />
  );
}
