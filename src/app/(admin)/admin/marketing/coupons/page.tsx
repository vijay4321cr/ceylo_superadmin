"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/coupons
 *   POST /admin/coupons
 *   PATCH /admin/coupons/:id
 */
export default function Page() {
  return (
    <ComingSoon
      title="Coupons"
      subtitle="Platform-wide discounts. Ceylo funds these, not the partner."
      purpose="Create and manage platform-funded discount codes."
      actionLabel="New coupon"
      columns={["Code","Discount","Min spend","Vertical","Used","Runs","Status",""]}
    />
  );
}
