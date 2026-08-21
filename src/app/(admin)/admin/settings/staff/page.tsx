"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

/**
 * Not built yet. When the API is ready this screen needs:
 *   GET /admin/staff
 *   POST /admin/staff/invite
 *   PATCH /admin/staff/:id
 */
export default function Page() {
  return <ComingSoon title="Staff" purpose="Invite console users, assign roles and disable accounts." />;
}
