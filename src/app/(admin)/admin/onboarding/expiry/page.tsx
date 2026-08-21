"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/partners/documents/expiring
 */
export default function Page() {
  return (
    <ComingSoon
      title="Document expiry"
      subtitle="Reminders at 30, 14 and 3 days. A lapse on a live partner raises an alert."
      purpose="Track date-bound documents and catch lapses before customers do."
      stats={["Auto-flagged","Lapsed","Expiring in 30 days"]}
      filters={[{"label":"Show","options":["Everything date-bound"]}]}
      columns={["Partner","Document","Vertical","Expires","Days left","Reminder","State"]}
    />
  );
}
