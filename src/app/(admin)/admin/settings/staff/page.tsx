"use client";

import { ComingSoon } from "@/components/admin/ComingSoon";

export default function Page() {
  return (
    <ComingSoon
      title="Staff"
      purpose="Invite console users, assign roles and disable accounts."
      endpoints={["GET /admin/staff","POST /admin/staff/invite","PATCH /admin/staff/:id"]}
    />
  );
}
