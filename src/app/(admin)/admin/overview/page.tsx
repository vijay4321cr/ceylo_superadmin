"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";
import { PageHead } from "@/components/admin/StaffShell";
import { Stat, Tile, TileHeader, LoadingRows } from "@/components/ui/Tile";
import { Button } from "@/components/ui/Button";
import { useStaffAuthStore } from "@/lib/stores/staffAuthStore";
import { analyticsOverview, kycQueue } from "@/lib/services/ceyloApi";
import { errorText } from "@/lib/api/client";
import { titleCase } from "@/lib/format";

/**
 * Everything here comes from the backend. Where a figure is not available,
 * the tile is simply absent rather than filled with a plausible number.
 */
export default function OverviewPage() {
  const session = useStaffAuthStore((s) => s.session);
  const token = session?.accessToken ?? "";

  const [nonce, setNonce] = useState(0);
  const [state, setState] = useState<{
    key: string;
    overview: Record<string, unknown> | null;
    pending: number | null;
    error: string;
  } | null>(null);

  const key = `${token.slice(-10)}|${nonce}`;

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    Promise.allSettled([analyticsOverview(token), kycQueue("PENDING", token)]).then(
      ([ov, kyc]) => {
        if (cancelled) return;
        setState({
          key,
          overview: ov.status === "fulfilled" ? ov.value : null,
          pending: kyc.status === "fulfilled" ? kyc.value.length : null,
          error:
            ov.status === "rejected" && kyc.status === "rejected"
              ? errorText(ov.reason)
              : "",
        });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [token, key]);

  const settled = state?.key === key ? state : null;

  if (!settled) return <LoadingRows rows={5} />;

  /** Render whatever numeric counters the overview endpoint returned. */
  const counters = Object.entries(settled.overview ?? {}).filter(
    ([, v]) => typeof v === "number",
  ) as [string, number][];

  return (
    <>
      <PageHead
        title={`Signed in as ${session?.phone ?? ""}`}
        subtitle="Live figures from the Ceylo backend."
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

      {settled.error && (
        <p className="mb-3 flex items-start gap-2 rounded-tile border border-danger/40 bg-danger-tint/40 px-3 py-2 text-[12px] text-ink">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-danger" aria-hidden />
          {settled.error}
        </p>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {settled.pending !== null && (
          <Stat
            label="Partners awaiting KYC"
            value={String(settled.pending)}
            tone={settled.pending ? "coral" : "ink"}
          />
        )}
        {counters.map(([k, v]) => (
          <Stat key={k} label={titleCase(k)} value={String(v)} />
        ))}
      </div>

      {settled.pending !== null && settled.pending > 0 && (
        <Link
          href="/admin/approvals"
          className="mb-4 flex items-center gap-2 rounded-tile border border-coral/40 bg-coral-tint/40 px-3 py-2 text-[12px] text-ink hover:bg-coral-tint/60"
        >
          <AlertTriangle className="size-3.5 shrink-0 text-coral" aria-hidden />
          <span className="flex-1">
            {settled.pending} partner{settled.pending === 1 ? "" : "s"} waiting on approval
          </span>
          <ArrowRight className="size-3.5 shrink-0" aria-hidden />
        </Link>
      )}

      {!settled.overview && !counters.length && settled.pending === null && (
        <Tile>
          <TileHeader
            title="Nothing to show yet"
            subtitle="The overview endpoint returned no numeric figures."
          />
          <p className="text-[12px] text-ink-mute">
            This console shows only what the backend reports. As
            <code className="mx-1 font-mono">GET /admin/analytics/overview</code>
            grows, the tiles here appear automatically.
          </p>
        </Tile>
      )}

      {settled.overview && (
        <details className="rounded-tile border border-line bg-paper">
          <summary className="cursor-pointer px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute">
            Raw overview response
          </summary>
          <pre className="scroll-thin max-h-72 overflow-auto border-t border-line-soft p-3 font-mono text-[11px] leading-relaxed text-ink-soft">
            {JSON.stringify(settled.overview, null, 2)}
          </pre>
        </details>
      )}
    </>
  );
}
