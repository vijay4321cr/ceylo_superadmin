"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/fraud/signals
 *   POST /admin/fraud/signals/:id/action
 */
export default function Page() {
  return <ComingSoon title="Fraud signals" purpose="Review duplicate accounts, velocity spikes and scalper detection with the evidence behind each." />;
}
