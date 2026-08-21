"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/refunds
 *   POST /admin/refunds/:id/approve
 *   POST /admin/refunds/:id/reject
 */
export default function Page() {
  return <ComingSoon title="Refunds" purpose="Review and decide customer refund requests within role limits." />;
}
