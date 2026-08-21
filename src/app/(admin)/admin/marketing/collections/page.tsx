"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/collections
 *   POST /admin/collections
 *   PUT /admin/collections/order
 */
export default function Page() {
  return (
    <ComingSoon
      title="Homepage collections"
      subtitle="Drag to set the order customers see on the Ceylo home screen."
      purpose="Curate and order the collections on the consumer home screen."
      actionLabel="New collection"
      columns={["Order","Collection","Vertical","District","Items","Status",""]}
    />
  );
}
