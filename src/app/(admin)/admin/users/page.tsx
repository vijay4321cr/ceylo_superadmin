"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { PageHead } from "@/components/admin/StaffShell";
import { DataTable, FilterBar, SearchInput, type Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useStaffAuthStore } from "@/lib/stores/staffAuthStore";
import { adminUsers, type AdminUser } from "@/lib/services/ceyloApi";
import { errorText } from "@/lib/api/client";
import { date } from "@/lib/format";

/** Customer and partner accounts, straight from GET /admin/users. */
export default function UsersPage() {
  const session = useStaffAuthStore((s) => s.session);
  const token = session?.accessToken ?? "";

  const [query, setQuery] = useState("");
  const [nonce, setNonce] = useState(0);
  const [state, setState] = useState<{ key: string; rows: AdminUser[] | null; error: string } | null>(
    null,
  );

  const key = `${token.slice(-10)}|${query}|${nonce}`;

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    adminUsers(query, token)
      .then((rows) => !cancelled && setState({ key, rows, error: "" }))
      .catch((e) => !cancelled && setState({ key, rows: null, error: errorText(e) }));
    return () => {
      cancelled = true;
    };
  }, [token, query, key]);

  const settled = state?.key === key ? state : null;

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      header: "Name",
      sortValue: (u) => u.name.toLowerCase(),
      cell: (u) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{u.name || "—"}</p>
          <p className="truncate font-mono text-[10px] text-ink-faint">{u.id}</p>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      sortValue: (u) => u.phone,
      cell: (u) => <span className="text-ink-soft">{u.phone || "—"}</span>,
    },
    {
      key: "email",
      header: "Email",
      cell: (u) => <span className="text-ink-mute">{u.email || "—"}</span>,
      hideBelow: "md",
    },
    {
      key: "role",
      header: "Role",
      sortValue: (u) => u.role,
      cell: (u) => <StatusBadge status={u.role === "customer" ? "low" : "active"} label={u.role} />,
    },
    {
      key: "created",
      header: "Joined",
      align: "right",
      sortValue: (u) => u.createdAt,
      cell: (u) => <span className="text-ink-mute">{u.createdAt ? date(u.createdAt) : "—"}</span>,
      hideBelow: "lg",
    },
  ];

  return (
    <>
      <PageHead
        title="Users"
        subtitle="Accounts on the Ceylo backend."
        action={
          <Button
            size="sm"
            variant="secondary"
            icon={<RefreshCw className="size-3.5" />}
            onClick={() => setNonce((n) => n + 1)}
          >
            Refresh
          </Button>
        }
      />

      <FilterBar>
        <SearchInput value={query} onChange={setQuery} placeholder="Phone, name or email" />
      </FilterBar>

      {settled?.error ? (
        <div className="rounded-tile border border-danger/40 bg-danger-tint/40 p-4">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-ink">
            <AlertTriangle className="size-4 text-danger" aria-hidden />
            Could not load users
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{settled.error}</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={settled?.rows ?? []}
          loading={!settled}
          rowKey={(u) => u.id}
          defaultSort="created"
          defaultDir="desc"
          emptyTitle="No users match"
          emptyBody="Try a different search term."
        />
      )}
    </>
  );
}
