"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

export default function Page() {
  return (
    <ComingSoon
      title="Listing moderation"
      purpose="Review partner changes to listings — photos, prices, descriptions, routes — before customers see them."
      endpoints={["GET /admin/listings/moderation","POST /admin/listings/:id/approve","POST /admin/listings/:id/reject"]}
    />
  );
}
