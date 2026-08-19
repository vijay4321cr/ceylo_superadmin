"use client";

import { Check, Minus } from "lucide-react";
import { PageHead } from "@/components/admin/StaffShell";
import { Tile, TileHeader } from "@/components/ui/Tile";
import { useStaffAuthStore } from "@/lib/stores/staffAuthStore";
import { ROLE_LABEL, staffCan, type Capability } from "@/lib/staffRbac";
import { dateTime } from "@/lib/format";
import type { StaffRole } from "@/lib/types";

const ROLES: StaffRole[] = ["super_admin", "ops", "finance", "marketing", "support"];

const CAPABILITIES: { id: Capability; label: string }[] = [
  { id: "applications.review", label: "Review & approve applications" },
  { id: "kyc.verify", label: "Verify / reject KYC documents" },
  { id: "partners.suspend", label: "Suspend / reactivate a partner" },
  { id: "moderation.decide", label: "Moderate listings & events" },
  { id: "commercials.set", label: "Set commission / convenience fee" },
  { id: "settlements.run", label: "Run settlements & payouts" },
  { id: "refunds.issue", label: "Issue refunds" },
  { id: "marketing.curate", label: "Homepage / collections / banners" },
  { id: "campaigns.send", label: "Notification campaigns" },
  { id: "staff.manage", label: "Manage staff & roles" },
  { id: "audit.view", label: "View audit logs" },
  { id: "support.tickets", label: "Support tickets" },
  { id: "trust.review", label: "Fraud & trust signals" },
  { id: "analytics.view", label: "Analytics" },
];

/**
 * Your session, and the permission model as the code actually enforces it.
 *
 * Worth being blunt here: the five-role model below is the product design, but
 * the backend only distinguishes admin from customer. Until it grows finer
 * roles, every console user is mapped to Super Admin.
 */
export default function RolesPage() {
  const session = useStaffAuthStore((s) => s.session);

  return (
    <>
      <PageHead
        title="Roles & permissions"
        subtitle="Read straight from staffRbac.ts — what you see here is what the app enforces."
      />

      <Tile className="mb-4">
        <TileHeader title="Your session" subtitle="Taken from the JWT the backend issued." />
        <dl className="grid gap-1.5 text-[12px] sm:grid-cols-2">
          <Row label="Phone" value={session?.phone} />
          <Row label="Backend role claim" value={session?.backendRole} />
          <Row label="Console role" value={session ? ROLE_LABEL[session.role] : ""} />
          <Row label="Signed in" value={session ? dateTime(session.signedInAt) : ""} />
          <Row label="User id" value={session?.staffId} />
        </dl>
      </Tile>

      <p className="mb-3 rounded-tile border border-peach/50 bg-peach-tint/40 px-3 py-2 text-[12px] leading-relaxed text-ink">
        The backend issues one of <code className="font-mono">customer</code>,{" "}
        <code className="font-mono">admin</code> or <code className="font-mono">super_admin</code>.
        Anything that is not an admin cannot open this console at all, and both admin claims map to
        Super Admin. The finer split below needs the API to carry a real staff role before it means
        anything.
      </p>

      <Tile padded={false}>
        <div className="overflow-x-auto scroll-thin">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-line bg-sand-soft/60">
                <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-ink-mute">
                  Capability
                </th>
                {ROLES.map((r) => (
                  <th
                    key={r}
                    className="px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-ink-mute"
                  >
                    {ROLE_LABEL[r].replace(" / Partner Success", "")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CAPABILITIES.map((cap) => (
                <tr key={cap.id} className="border-b border-line-soft last:border-0">
                  <td className="px-3 py-1.5">
                    <p className="text-ink">{cap.label}</p>
                    <p className="font-mono text-[10px] text-ink-faint">{cap.id}</p>
                  </td>
                  {ROLES.map((role) => {
                    const allowed = staffCan(
                      {
                        staffId: "preview",
                        phone: "",
                        role,
                        backendRole: "",
                        accessToken: "",
                        refreshToken: null,
                        signedInAt: "",
                      },
                      cap.id,
                    );
                    return (
                      <td key={role} className="px-3 py-1.5 text-center">
                        {allowed ? (
                          <Check className="mx-auto size-3.5 text-ok" aria-label="Allowed" />
                        ) : (
                          <Minus className="mx-auto size-3.5 text-ink-faint" aria-label="Denied" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Tile>
    </>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-ink-mute">{label}</dt>
      <dd className="min-w-0 break-words text-right font-mono text-[11px] text-ink">
        {value || "—"}
      </dd>
    </div>
  );
}
