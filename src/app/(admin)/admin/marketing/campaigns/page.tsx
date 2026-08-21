"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/campaigns
 *   POST /admin/campaigns
 *   GET /admin/segments
 */
export default function Page() {
  return (
    <ComingSoon
      title="Campaigns"
      subtitle="Push, SMS and email. No WhatsApp."
      purpose="Build and send campaigns to an audience segment."
      actionLabel="New campaign"
      columns={["Campaign","Channels","Audience","Open rate","Sent / scheduled","Status"]}
    />
  );
}
