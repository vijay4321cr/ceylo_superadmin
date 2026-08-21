"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/catalog/categories
 */
export default function Page() {
  return (
    <ComingSoon
      title="Categories & vocabularies"
      subtitle="The shared lists behind search, filters and partner setup."
      purpose="Manage cuisines, event categories, ports and occasions."
    />
  );
}
