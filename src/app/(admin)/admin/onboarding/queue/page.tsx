"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/applications
 *   GET /admin/applications/:id
 *   POST /admin/applications/:id/decision
 */
export default function Page() {
  return <ComingSoon title="Application queue" purpose="Applications submitted through the Ceylo onboarding wizard, before KYC review." />;
}
