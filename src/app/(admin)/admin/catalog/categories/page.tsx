"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

export default function Page() {
  return (
    <ComingSoon
      title="Categories & vocabularies"
      purpose="The controlled lists behind search, filters and partner setup."
      endpoints={["GET /admin/catalog/categories"]}
    />
  );
}
