"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/reviews/moderation
 *   POST /admin/reviews/:id/approve
 *   POST /admin/reviews/:id/reject
 */
export default function Page() {
  return <ComingSoon title="Review moderation" purpose="Handle customer reviews reported by partners or flagged automatically." />;
}
