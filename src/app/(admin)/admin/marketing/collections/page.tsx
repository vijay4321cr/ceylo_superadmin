"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

export default function Page() {
  return (
    <ComingSoon
      title="Homepage collections"
      purpose="Curate and order the collections customers see on the Ceylo home screen."
      endpoints={["GET /admin/collections","POST /admin/collections","PUT /admin/collections/order"]}
    />
  );
}
