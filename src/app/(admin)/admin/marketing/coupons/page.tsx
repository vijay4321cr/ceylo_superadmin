"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

export default function Page() {
  return (
    <ComingSoon
      title="Coupons"
      purpose="Create and manage platform-funded discount codes."
      endpoints={["GET /admin/coupons","POST /admin/coupons","PATCH /admin/coupons/:id"]}
    />
  );
}
