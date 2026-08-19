"use client";

import { Lock } from "lucide-react";
import { StepShell } from "@/components/onboarding/StepShell";
import { Checkbox } from "@/components/ui/Field";
import { useT } from "@/lib/i18n/useT";
import { useOnboardingStore } from "@/lib/stores/onboardingStore";
import { money, pct } from "@/lib/format";
import { settleLine } from "@/lib/settlement";
import type { DictKey } from "@/lib/i18n/config";

/** A worked example beats a rate card — this is what "12%" actually means. */
const EXAMPLE_GROSS = 1_000_000; // Rs 10,000 in cents

export default function CommercialsPage() {
  const { t, locale } = useT();
  const draft = useOnboardingStore((s) => s.draft);
  const patch = useOnboardingStore((s) => s.patch);
  const c = draft.commercials;

  const { commissionCents, whtCents, netCents } = settleLine(EXAMPLE_GROSS, {
    commissionPct: c.commissionPct,
    whtPct: c.whtPct,
  });

  const cycleKey: Record<string, DictKey> = {
    weekly: "commercials.weekly",
    fortnightly: "commercials.fortnightly",
    monthly: "commercials.monthly",
  };

  return (
    <StepShell
      routeId="commercials"
      title={t("commercials.title")}
      subtitle={t("commercials.subtitle")}
      onContinue={() => draft.commercialsAcknowledged}
      continueDisabled={!draft.commercialsAcknowledged}
    >
      <div className="rounded-tile border border-line bg-paper">
        <Row
          label={t("commercials.commission")}
          value={pct(c.commissionPct)}
          hint={t("commercials.commissionHint")}
          locked
        />
        <Row
          label={t("commercials.convenienceFee")}
          value={money(c.convenienceFeeCents, locale)}
          hint={t("commercials.convenienceHint")}
          locked
        />
        <Row label={t("commercials.cycle")} value={t(cycleKey[c.settlementCycle])} locked />
        <Row
          label={t("commercials.wht")}
          value={pct(c.whtPct)}
          hint={t("commercials.whtHint")}
          locked
          last
        />
      </div>

      {/* The same gross → commission → WHT = net maths the dashboard renders. */}
      <section className="rounded-tile border border-line bg-sand-soft/60 p-4">
        <p className="text-sm font-semibold text-ink">{t("commercials.example")}</p>
        <dl className="mt-3 flex flex-col gap-2 text-sm">
          <Line label={t("commercials.gross")} value={money(EXAMPLE_GROSS, locale)} />
          <Line
            label={`${t("commercials.commission")} (${pct(c.commissionPct)})`}
            value={`− ${money(commissionCents, locale)}`}
          />
          <Line
            label={`${t("commercials.wht")} (${pct(c.whtPct)})`}
            value={`+ ${money(whtCents, locale)}`}
            hint="Ceylo remits this to the Inland Revenue on your behalf."
          />
          <div className="mt-1 flex items-baseline justify-between border-t border-line pt-2">
            <dt className="text-sm font-semibold text-ink">{t("commercials.net")}</dt>
            <dd className="font-display text-lg font-semibold tabular-nums text-ink">
              {money(netCents, locale)}
            </dd>
          </div>
        </dl>
      </section>

      {draft.bank.accountName && (
        <p className="text-xs text-ink-mute">
          {t("commercials.payoutTo")}: <span className="text-ink">{draft.bank.accountName}</span> ·{" "}
          {draft.bank.bankName} {draft.bank.branchName} · ••••
          {draft.bank.accountNumber.slice(-4)}
        </p>
      )}

      <Checkbox
        label="I understand these terms"
        description="You can ask us to review your rates at any time once you are live."
        checked={draft.commercialsAcknowledged}
        onChange={(v) => patch({ commercialsAcknowledged: v })}
      />
    </StepShell>
  );
}

function Row({
  label,
  value,
  hint,
  locked,
  last,
}: {
  label: string;
  value: string;
  hint?: string;
  locked?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 px-4 py-3.5 ${last ? "" : "border-b border-line-soft"}`}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{label}</p>
        {hint && <p className="mt-0.5 text-xs leading-relaxed text-ink-mute">{hint}</p>}
      </div>
      <p className="flex shrink-0 items-center gap-1.5 font-display text-base font-semibold tabular-nums text-ink">
        {locked && <Lock className="size-3 text-ink-faint" aria-label="Set by Ceylo" />}
        {value}
      </p>
    </div>
  );
}

function Line({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink-mute">
        {label}
        {hint && <span className="mt-0.5 block text-xs text-ink-faint">{hint}</span>}
      </dt>
      <dd className="shrink-0 tabular-nums text-ink">{value}</dd>
    </div>
  );
}
