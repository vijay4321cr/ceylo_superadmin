"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/finance/commissions
 *   PUT /admin/finance/commissions
 */
export default function Page() {
  return (
    <ComingSoon
      title="Commissions & fees"
      subtitle="Partner overrides beat category rates, which beat district rates."
      purpose="Set commission, convenience fee, settlement cycle and WHT per partner, category or district."
      actionLabel="New rate"
      columns={["Applies to","Commission","Convenience fee","Cycle","WHT","Net on Rs 10,000","Updated"]}
    />
  );
}
