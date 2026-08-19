"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

export default function Page() {
  return (
    <ComingSoon
      title="Document expiry"
      purpose="Date-bound documents sorted by days to expiry, with auto-flagging when a live partner lapses."
      endpoints={["GET /admin/partners/documents/expiring"]}
    />
  );
}
