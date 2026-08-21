"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/audit-logs
 */
export default function Page() {
  return (
    <ComingSoon
      title="Audit logs"
      subtitle="Every staff and partner mutation, with what changed."
      purpose="Trace who did what, when, and what the value was before and after."
      search="Action, entity id or actor"
      filters={[{"label":"Actor","options":["Anyone"]},{"label":"Entity","options":["All entities"]},{"label":"Action","options":["All actions"]}]}
      columns={["When","Actor","Action","Entity","Change"]}
    />
  );
}
