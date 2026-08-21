"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/listings/moderation
 *   POST /admin/listings/:id/approve
 *   POST /admin/listings/:id/reject
 */
export default function Page() {
  return <ComingSoon title="Listing moderation" purpose="Review partner changes to listings — photos, prices, descriptions, routes — before customers see them." />;
}
