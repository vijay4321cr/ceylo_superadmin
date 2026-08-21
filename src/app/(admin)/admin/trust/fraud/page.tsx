"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/fraud/signals
 *   POST /admin/fraud/signals/:id/action
 */
export default function Page() {
  return (
    <ComingSoon
      title="Fraud signals"
      subtitle="Each signal carries the evidence that triggered it."
      purpose="Review duplicate accounts, velocity spikes and scalper detection."
      stats={["Open signals","High severity","In this view"]}
      filters={[{"label":"Status","options":["Open"]}]}
      columns={["Signal","Subject","Severity","Detected","Status",""]}
    />
  );
}
