"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

export default function Page() {
  return (
    <ComingSoon
      title="GMV"
      purpose="Gross merchandise value by month, vertical and district."
      endpoints={["GET /admin/analytics/gmv"]}
    />
  );
}
