"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

export default function Page() {
  return (
    <ComingSoon
      title="Districts"
      purpose="Coverage and performance per district, used to route applications to the right queue."
      endpoints={["GET /admin/catalog/districts"]}
    />
  );
}
