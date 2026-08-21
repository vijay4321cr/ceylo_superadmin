"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/partners
 *   GET /admin/partners/:id
 *   PATCH /admin/partners/:id/status
 */
export default function Page() {
  return <ComingSoon title="Partners" purpose="Directory of every business on Ceylo with per-vertical status and health." />;
}
