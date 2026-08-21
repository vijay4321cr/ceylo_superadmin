"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/featured
 *   POST /admin/featured
 */
export default function Page() {
  return (
    <ComingSoon
      title="Featured slots"
      subtitle="Monetised placements. Partners pay for these, so they are revenue."
      purpose="Sell and schedule paid placement slots for partners."
      stats={["Active slots","Booked revenue","Live now"]}
      columns={["Partner","Slot","Vertical","District","Runs","Price","Status"]}
    />
  );
}
