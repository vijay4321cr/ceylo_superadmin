"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, RefreshCw, X } from "lucide-react";
import { PageHead } from "@/components/admin/StaffShell";
import { FilterBar, FilterSelect } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, LoadingRows, Stat } from "@/components/ui/Tile";
import { toast } from "@/components/ui/Toast";
import { useStaffAuthStore } from "@/lib/stores/staffAuthStore";
import { staffCan } from "@/lib/staffRbac";
import { errorText } from "@/lib/api/client";
import {
  approveEvent,
  eventModerationQueue,
  rejectEvent,
  type ModerationEvent,
} from "@/lib/services/ceyloApi";
import { dateTime } from "@/lib/format";

/**
 * Event moderation — live. Every event is checked before it can sell a ticket,
 * so this is a recurring queue, not a one-time gate.
 */
export default function EventModerationPage() {
  const session = useStaffAuthStore((s) => s.session);
  const token = session?.accessToken ?? "";
  const canDecide = staffCan(session, "moderation.decide");

  const [status, setStatus] = useState("PENDING_APPROVAL");
  const [nonce, setNonce] = useState(0);
  const [state, setState] = useState<{
    key: string;
    rows: ModerationEvent[] | null;
    error: string;
  } | null>(null);

  const [deciding, setDeciding] = useState<{
    row: ModerationEvent;
    verdict: "approve" | "reject";
  } | null>(null);
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const key = `${token.slice(-10)}|${status}|${nonce}`;

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    eventModerationQueue(status, token)
      .then((rows) => !cancelled && setState({ key, rows, error: "" }))
      .catch((e) => !cancelled && setState({ key, rows: null, error: errorText(e) }));
    return () => {
      cancelled = true;
    };
  }, [token, status, key]);

  const settled = state?.key === key ? state : null;
  const rows = settled?.rows ?? null;

  async function decide() {
    if (!deciding || !token) return;
    if (deciding.verdict === "reject" && !reason.trim()) {
      setFormError("Give a reason — the organiser is told why.");
      return;
    }
    setBusy(true);
    try {
      if (deciding.verdict === "approve") await approveEvent(deciding.row.id, token);
      else await rejectEvent(deciding.row.id, reason.trim(), token);
      toast(
        deciding.verdict === "approve"
          ? `${deciding.row.name} approved — tickets can go on sale`
          : `${deciding.row.name} rejected`,
        deciding.verdict === "approve" ? "ok" : "info",
      );
      setDeciding(null);
      setReason("");
      setFormError("");
      setNonce((n) => n + 1);
    } catch (e) {
      setFormError(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title="Event moderation"
        subtitle="Every event, every time — before a single ticket can be sold."
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

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <Stat label="In this view" value={rows ? String(rows.length) : "—"} />
        <Stat
          label="Awaiting decision"
          value={
            rows ? String(rows.filter((r) => r.status.toUpperCase().includes("PENDING")).length) : "—"
          }
        />
      </div>

      <FilterBar>
        <FilterSelect
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "PENDING_APPROVAL", label: "Pending approval" },
            { value: "APPROVED", label: "Approved" },
            { value: "REJECTED", label: "Rejected" },
            { value: "ALL", label: "All" },
          ]}
        />
      </FilterBar>

      {settled?.error ? (
        <div className="rounded-tile border border-danger/40 bg-danger-tint/40 p-4">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-ink">
            <AlertTriangle className="size-4 text-danger" aria-hidden />
            Could not load the moderation queue
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{settled.error}</p>
          <Button
            size="sm"
            variant="secondary"
            className="mt-3"
            icon={<RefreshCw className="size-3.5" />}
            onClick={() => setNonce((n) => n + 1)}
          >
            Try again
          </Button>
        </div>
      ) : !settled ? (
        <LoadingRows rows={4} />
      ) : rows && rows.length === 0 ? (
        <EmptyState
          title="Nothing waiting"
          body="No events with this status on the backend."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {(rows ?? []).map((row) => (
            <li key={row.id} className="rounded-tile border border-line bg-paper p-3 shadow-tile">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13px] font-semibold text-ink">{row.name}</p>
                    <StatusBadge status={row.status.toLowerCase()} />
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-ink-mute">
                    {row.organiser && <span>{row.organiser}</span>}
                    {row.venue && <span>· {row.venue}</span>}
                    {row.category && <span>· {row.category}</span>}
                    {row.startAt && <span>· starts {dateTime(row.startAt)}</span>}
                  </p>

                </div>

                {canDecide && row.status.toUpperCase().includes("PENDING") && (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<X className="size-3.5" />}
                      onClick={() => {
                        setReason("");
                        setFormError("");
                        setDeciding({ row, verdict: "reject" });
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      icon={<Check className="size-3.5" />}
                      onClick={() => {
                        setReason("");
                        setFormError("");
                        setDeciding({ row, verdict: "approve" });
                      }}
                    >
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={!!deciding}
        onClose={() => {
          setDeciding(null);
          setFormError("");
        }}
        title={
          deciding?.verdict === "approve"
            ? `Approve ${deciding?.row.name}`
            : `Reject ${deciding?.row.name ?? ""}`
        }
        description={
          deciding?.verdict === "approve"
            ? "Tickets go on sale as soon as this is approved. This writes to the live backend."
            : "The organiser receives this reason."
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
              {deciding?.verdict === "approve" ? "Approve event" : "Reject event"}
            </Button>
          </>
        }
      >
        {deciding?.verdict === "reject" ? (
          <Textarea
            label="Reason"
            required
            rows={4}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setFormError("");
            }}
            error={formError}
            placeholder="e.g. No police permit supplied for a public gathering."
          />
        ) : (
          formError && (
            <p role="alert" className="text-xs text-danger">
              {formError}
            </p>
          )
        )}
      </Modal>
    </>
  );
}
