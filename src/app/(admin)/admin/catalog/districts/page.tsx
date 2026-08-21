"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/catalog/districts
 */
export default function Page() {
  return (
    <ComingSoon
      title="Districts"
      subtitle="All 25 districts, and what each is worth to the marketplace."
      purpose="See coverage and performance per district."
      columns={["District","Province","Partners","Live","Applications","GMV"]}
    />
  );
}
