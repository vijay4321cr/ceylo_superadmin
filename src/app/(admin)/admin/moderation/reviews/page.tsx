"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

export default function Page() {
  return (
    <ComingSoon
      title="Review moderation"
      purpose="Handle customer reviews reported by partners or flagged automatically."
      endpoints={["GET /admin/reviews/moderation","POST /admin/reviews/:id/approve","POST /admin/reviews/:id/reject"]}
    />
  );
}
