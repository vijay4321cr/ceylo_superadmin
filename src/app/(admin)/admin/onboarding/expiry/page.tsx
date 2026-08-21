"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/partners/documents/expiring
 */
export default function Page() {
  return <ComingSoon title="Document expiry" purpose="Date-bound documents sorted by days to expiry, with auto-flagging when a live partner lapses." />;
}
