"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStaffAuthStore } from "@/lib/stores/staffAuthStore";
import { landingFor } from "@/lib/staffRbac";

/**
 * `/admin` is a container, not a screen — without this it 404s, which is a
 * confusing thing to hit when you type the obvious URL. Send signed-in staff
 * to their role's front door, and everyone else to sign in.
 */
export default function AdminIndexPage() {
  const router = useRouter();
  const session = useStaffAuthStore((s) => s.session);
  const hydrated = useStaffAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    router.replace(session ? landingFor(session.role) : "/admin/login");
  }, [hydrated, session, router]);

  return (
    <div className="flex flex-col gap-3 p-2">
      <div className="skeleton h-6 w-48 rounded-chip" />
      <div className="skeleton h-32 w-full rounded-tile" />
    </div>
  );
}
