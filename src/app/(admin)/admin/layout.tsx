"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { StaffShell } from "@/components/admin/StaffShell";

/**
 * The staff route group. Guards on `staffAuthStore` — never on the partner
 * `authStore`. Login is the one route inside `/admin` that renders bare.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return <>{children}</>;
  return <StaffShell>{children}</StaffShell>;
}
