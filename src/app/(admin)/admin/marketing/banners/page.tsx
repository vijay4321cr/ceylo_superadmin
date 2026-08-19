"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

export default function Page() {
  return (
    <ComingSoon
      title="Banners"
      purpose="Schedule promotional placements across the consumer app and track their performance."
      endpoints={["GET /admin/banners","POST /admin/banners"]}
    />
  );
}
