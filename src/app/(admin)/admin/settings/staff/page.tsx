"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/staff
 *   POST /admin/staff/invite
 *   PATCH /admin/staff/:id
 */
export default function Page() {
  return (
    <ComingSoon
      title="Staff"
      subtitle="Console accounts and what they can reach."
      purpose="Invite console users, assign roles and disable accounts."
      actionLabel="Invite someone"
      columns={["Person","Role","Status","Last active",""]}
    />
  );
}
