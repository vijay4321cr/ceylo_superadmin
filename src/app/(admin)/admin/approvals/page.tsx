"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, ExternalLink, FileText, Info, RefreshCw, X } from "lucide-react";
import { PageHead } from "@/components/admin/StaffShell";
import { DataTable, FilterBar, FilterSelect, SearchInput, type Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, LoadingRows, Stat, Tile, TileHeader } from "@/components/ui/Tile";
import { toast } from "@/components/ui/Toast";
import { useStaffAuthStore } from "@/lib/stores/staffAuthStore";
import { staffCan } from "@/lib/staffRbac";
import { errorText } from "@/lib/api/client";
import {
  approveKyc,
  kycQueue,
  rejectKyc,
  type ApprovalRow,
  type KycStatus,
} from "@/lib/services/ceyloApi";
import { date, dateTime, relative } from "@/lib/format";

/**
 * Partner approvals — the already-registered path.
 *
 * The application queue elsewhere in this console covers partners applying
 * through the Ceylo onboarding wizard. This tab covers the other case: a
 * partner who already registered against the CYLO backend and submitted KYC,
 * and is now waiting for a human to approve or reject them.
 *
 * Unlike every other screen here, this one is LIVE — it reads and writes the
 * real backend, so it needs a real token (see the connection bar) and it can
 * genuinely fail.
 */
export default function PartnerApprovalsPage() {
  const session = useStaffAuthStore((s) => s.session);
  const hydrated = useStaffAuthStore((s) => s.hydrated);
  const token = session?.accessToken ?? "";

  const [status, setStatus] = useState<KycStatus | "ALL">("PENDING");
  const [search, setSearch] = useState("");
  /** Bumped to force a refetch — changing the key re-runs the request. */
  const [reloadNonce, setReloadNonce] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    rows: ApprovalRow[] | null;
    error: string;
  } | null>(null);

  const [open, setOpen] = useState<ApprovalRow | null>(null);
  const [deciding, setDeciding] = useState<{ row: ApprovalRow; verdict: "approve" | "reject" } | null>(
    null,
  );
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState("");
  const [busy, setBusy] = useState(false);

  const canDecide = staffCan(session, "kyc.verify");

  const requestKey = token ? `${token.slice(-12)}|${status}|${reloadNonce}` : "";

  useEffect(() => {
    if (!hydrated || !token) return;
    let cancelled = false;
    kycQueue(status, token)
      .then((rows) => {
        if (!cancelled) setResult({ key: requestKey, rows, error: "" });
      })
      .catch((e) => {
        if (!cancelled) setResult({ key: requestKey, rows: null, error: errorText(e) });
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, token, status, requestKey]);

  // Anything not matching the current key is a stale answer, so the screen
  // shows a skeleton rather than the previous filter's rows.
  const settled = result?.key === requestKey ? result : null;
  const rows = settled?.rows ?? null;
  const error = settled?.error ?? "";
  const loading = !!token && hydrated && !settled;
  const refetch = () => setReloadNonce((n) => n + 1);

  async function decide() {
    if (!deciding || !token) return;
    const { row, verdict } = deciding;

    if (verdict === "reject" && !note.trim()) {
      setNoteError("Give a reason — the partner is told why they were rejected.");
      return;
    }

    setBusy(true);
    try {
      if (verdict === "approve") await approveKyc(row.partnerId, note.trim(), token);
      else await rejectKyc(row.partnerId, note.trim(), token);

      toast(
        verdict === "approve"
          ? `${row.businessName} approved`
          : `${row.businessName} rejected`,
        verdict === "approve" ? "ok" : "info",
      );
      setDeciding(null);
      setOpen(null);
      setNote("");
      setNoteError("");
      refetch();
    } catch (e) {
      setNoteError(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  const filtered = (rows ?? []).filter((r) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      r.businessName.toLowerCase().includes(q) ||
      r.contactName.toLowerCase().includes(q) ||
      r.contactPhone.toLowerCase().includes(q) ||
      r.partnerId.toLowerCase().includes(q)
    );
  });

  const pending = (rows ?? []).filter((r) => String(r.status).toUpperCase() === "PENDING");

  const columns: Column<ApprovalRow>[] = [
    {
      key: "business",
      header: "Partner",
      sortValue: (r) => r.businessName.toLowerCase(),
      cell: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{r.businessName}</p>
          <p className="truncate font-mono text-[10px] text-ink-faint">{r.partnerId}</p>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      sortValue: (r) => r.contactName.toLowerCase(),
      cell: (r) => (
        <div className="min-w-0">
          <p className="truncate text-ink-soft">{r.contactName || "—"}</p>
          <p className="truncate text-[11px] text-ink-mute">{r.contactPhone || r.contactEmail || "—"}</p>
        </div>
      ),
      hideBelow: "sm",
    },
    {
      key: "docs",
      header: "KYC on file",
      cell: (r) => {
        const present = [
          r.kyc.fssaiNumber && "FSSAI",
          r.kyc.gstNumber && "GST",
          r.kyc.panNumber && "PAN",
          r.kyc.bankAccountNumber && "Bank",
        ].filter(Boolean) as string[];
        return present.length ? (
          <div className="flex flex-wrap gap-1">
            {present.map((d) => (
              <span
                key={d}
                className="rounded-chip border border-line bg-sand-soft px-1.5 py-0.5 text-[10px] text-ink-soft"
              >
                {d}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[11px] text-ink-faint">nothing submitted</span>
        );
      },
      hideBelow: "md",
    },
    {
      key: "restaurant",
      header: "Listing",
      sortValue: (r) => r.restaurant?.name?.toLowerCase() ?? "",
      cell: (r) =>
        r.restaurant ? (
          <div className="min-w-0">
            <p className="truncate text-ink-soft">{r.restaurant.name}</p>
            <p className="truncate text-[11px] text-ink-mute">
              {[r.restaurant.area, r.restaurant.listingStatus].filter(Boolean).join(" · ")}
            </p>
          </div>
        ) : (
          <span className="text-[11px] text-ink-faint">—</span>
        ),
      hideBelow: "md",
    },
    {
      key: "submitted",
      header: "Submitted",
      align: "right",
      sortValue: (r) => r.submittedAt,
      cell: (r) => (
        <span className="text-ink-mute">{r.submittedAt ? relative(r.submittedAt) : "—"}</span>
      ),
      hideBelow: "lg",
    },
    {
      key: "status",
      header: "Status",
      sortValue: (r) => String(r.status),
      cell: (r) => <StatusBadge status={String(r.status).toLowerCase()} />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (r) =>
        String(r.status).toUpperCase() === "PENDING" && canDecide ? (
          <div className="flex justify-end gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              icon={<X className="size-3" />}
              onClick={(e) => {
                e.stopPropagation();
                setNote("");
                setNoteError("");
                setDeciding({ row: r, verdict: "reject" });
              }}
            >
              Reject
            </Button>
            <Button
              size="sm"
              icon={<Check className="size-3" />}
              onClick={(e) => {
                e.stopPropagation();
                setNote("");
                setNoteError("");
                setDeciding({ row: r, verdict: "approve" });
              }}
            >
              Approve
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <>
      <PageHead
        title="Partner approvals"
        subtitle="Partners who already registered and submitted KYC, waiting on a decision. Live against the CYLO backend."
        action={
          token ? (
            <Button
              size="sm"
              variant="secondary"
              icon={<RefreshCw className="size-3.5" />}
              loading={loading}
              onClick={refetch}
            >
              Refresh
            </Button>
          ) : undefined
        }
      />

      {/* The backend this talks to stores Indian KYC fields. Saying so here is
          cheaper than letting someone assume the two schemas already line up. */}
      <p className="mb-3 flex items-start gap-2 rounded-tile border border-peach/50 bg-peach-tint/40 px-3 py-2 text-[12px] text-ink">
        <Info className="mt-0.5 size-3.5 shrink-0 text-peach" aria-hidden />
        <span>
          This backend stores KYC as <strong>FSSAI, GST, PAN and IFSC</strong>. The Ceylo onboarding
          wizard collects the Sri Lankan set — <strong>BRN, TIN, VAT, NIC</strong> and bank + branch
          codes. The fields below are shown exactly as the API returns them; the two schemas still
          need reconciling before this becomes the Sri Lanka approval path.
        </span>
      </p>

      {!hydrated ? (
        <LoadingRows rows={4} />
      ) : !token ? (
        <EmptyState
          icon={<FileText className="size-6" />}
          title="Not signed in"
          body="Sign in again to load partners waiting for approval."
        />
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <Stat label="Awaiting approval" value={String(pending.length)} tone={pending.length ? "coral" : "ink"} />
            <Stat label="In this view" value={String(rows?.length ?? 0)} />
            <Stat
              label="Oldest waiting"
              value={
                pending.length && pending.some((p) => p.submittedAt)
                  ? date(
                      pending
                        .filter((p) => p.submittedAt)
                        .reduce((a, b) => (a.submittedAt < b.submittedAt ? a : b)).submittedAt,
                    )
                  : "—"
              }
            />
          </div>

          <FilterBar>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Business, contact, phone or partner id"
            />
            <FilterSelect
              label="KYC status"
              value={status}
              onChange={(v) => setStatus(v as KycStatus | "ALL")}
              options={[
                { value: "PENDING", label: "Pending" },
                { value: "APPROVED", label: "Approved" },
                { value: "REJECTED", label: "Rejected" },
                { value: "ALL", label: "All" },
              ]}
            />
          </FilterBar>

          {error ? (
            <div className="rounded-tile border border-danger/40 bg-danger-tint/40 p-4">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                <AlertTriangle className="size-4 text-danger" aria-hidden />
                Could not load the approval queue
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{error}</p>
              <Button
                size="sm"
                variant="secondary"
                className="mt-3"
                icon={<RefreshCw className="size-3.5" />}
                onClick={refetch}
              >
                Try again
              </Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={filtered}
              loading={loading}
              rowKey={(r) => r.partnerId}
              defaultSort="submitted"
              onRowClick={setOpen}
              emptyTitle={status === "PENDING" ? "Nothing waiting" : "No partners match"}
              emptyBody={
                status === "PENDING"
                  ? "Every registered partner has been decided."
                  : "Try a different status or search."
              }
            />
          )}
        </>
      )}

      {/* Detail */}
      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        width="lg"
        title={open?.businessName ?? ""}
        description={open ? `Partner ${open.partnerId}` : undefined}
        footer={
          open && String(open.status).toUpperCase() === "PENDING" && canDecide ? (
            <>
              <Button
                size="sm"
                variant="secondary"
                icon={<X className="size-3.5" />}
                onClick={() => {
                  setNote("");
                  setNoteError("");
                  setDeciding({ row: open, verdict: "reject" });
                }}
              >
                Reject
              </Button>
              <Button
                size="sm"
                icon={<Check className="size-3.5" />}
                onClick={() => {
                  setNote("");
                  setNoteError("");
                  setDeciding({ row: open, verdict: "approve" });
                }}
              >
                Approve
              </Button>
            </>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => setOpen(null)}>
              Close
            </Button>
          )
        }
      >
        {open && (
          <div className="flex flex-col gap-3">
            <Tile>
              <TileHeader title="Contact" />
              <dl className="grid gap-1.5 text-[12px] sm:grid-cols-2">
                <Row label="Contact name" value={open.contactName} />
                <Row label="Phone" value={open.contactPhone} />
                <Row label="Email" value={open.contactEmail} />
                <Row
                  label="Submitted"
                  value={open.submittedAt ? dateTime(open.submittedAt) : ""}
                />
              </dl>
            </Tile>

            {open.restaurant && (
              <Tile>
                <TileHeader
                  title="Listing awaiting this approval"
                  subtitle="Approving the KYC is what lets this listing go live."
                />
                <dl className="grid gap-1.5 text-[12px] sm:grid-cols-2">
                  <Row label="Restaurant" value={open.restaurant.name} />
                  <Row label="Area" value={open.restaurant.area} />
                  <Row label="Listing status" value={open.restaurant.listingStatus} />
                  <Row label="Restaurant id" value={open.restaurant.id} />
                </dl>
              </Tile>
            )}

            <Tile>
              <TileHeader
                title="KYC as returned by the backend"
                subtitle="Blank means the API did not return that field."
              />
              <dl className="grid gap-1.5 text-[12px] sm:grid-cols-2">
                <Row label="FSSAI number" value={open.kyc.fssaiNumber} />
                <Row label="GST number" value={open.kyc.gstNumber} />
                <Row label="PAN number" value={open.kyc.panNumber} />
                <Row label="Bank account name" value={open.kyc.bankAccountName} />
                <Row label="Bank account number" value={open.kyc.bankAccountNumber} />
                <Row label="IFSC" value={open.kyc.bankIfsc} />
              </dl>

              <div className="mt-3 flex flex-wrap gap-2">
                <DocLink label="FSSAI certificate" href={open.kyc.fssaiDocUrl} />
                <DocLink label="GST certificate" href={open.kyc.gstDocUrl} />
                <DocLink label="Cancelled cheque" href={open.kyc.cancelledChequeUrl} />
              </div>
            </Tile>

            {/* The collection pins down the request shapes, not the response.
                Showing the raw object means an operator can always see the
                truth rather than only the fields this UI happens to map. */}
            <details className="rounded-tile border border-line bg-paper">
              <summary className="cursor-pointer px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute">
                Raw API response
              </summary>
              <pre className="scroll-thin max-h-64 overflow-auto border-t border-line-soft p-3 font-mono text-[11px] leading-relaxed text-ink-soft">
                {JSON.stringify(open.raw, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </Modal>

      {/* Decision */}
      <Modal
        open={!!deciding}
        onClose={() => {
          setDeciding(null);
          setNoteError("");
        }}
        title={
          deciding?.verdict === "approve"
            ? `Approve ${deciding?.row.businessName}`
            : `Reject ${deciding?.row.businessName ?? ""}`
        }
        description={
          deciding?.verdict === "approve"
            ? "The partner is approved on the backend and can start trading. This writes to the live API."
            : "The partner is rejected on the backend and receives this reason."
        }
        footer={
          <>
            <Button size="sm" variant="secondary" onClick={() => setDeciding(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant={deciding?.verdict === "reject" ? "danger" : "primary"}
              loading={busy}
              onClick={decide}
            >
              {deciding?.verdict === "approve" ? "Approve partner" : "Reject partner"}
            </Button>
          </>
        }
      >
        <Textarea
          label={deciding?.verdict === "approve" ? "Notes (optional)" : "Reason"}
          required={deciding?.verdict === "reject"}
          rows={4}
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setNoteError("");
          }}
          error={noteError}
          placeholder={
            deciding?.verdict === "approve"
              ? "e.g. Docs OK"
              : "e.g. The FSSAI scan is unreadable — upload a clearer copy."
          }
        />
      </Modal>
    </>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-ink-mute">{label}</dt>
      <dd className="min-w-0 break-words text-right text-ink">{value || "—"}</dd>
    </div>
  );
}

function DocLink({ label, href }: { label: string; href?: string }) {
  if (!href) {
    return (
      <span className="rounded-chip border border-dashed border-line px-2.5 py-1 text-[11px] text-ink-faint">
        {label} — not provided
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-chip border border-line bg-paper px-2.5 py-1 text-[11px] text-ink hover:bg-cream-deep"
    >
      <FileText className="size-3" aria-hidden />
      {label}
      <ExternalLink className="size-2.5 text-ink-faint" aria-hidden />
    </a>
  );
}
