"use client";

import { useRef, useState } from "react";
import { BadgeCheck, ScrollText } from "lucide-react";
import { StepShell } from "@/components/onboarding/StepShell";
import { Input } from "@/components/ui/Field";
import { useT } from "@/lib/i18n/useT";
import { useOnboardingStore, AGREEMENT_VERSION } from "@/lib/stores/onboardingStore";
import { dateTime, pct, money } from "@/lib/format";
import { AGREEMENT_CLAUSES } from "@/lib/agreementText";

export default function AgreementPage() {
  const { t, locale } = useT();
  const draft = useOnboardingStore((s) => s.draft);
  const patch = useOnboardingStore((s) => s.patch);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [readToEnd, setReadToEnd] = useState(false);
  const [typed, setTyped] = useState(draft.agreement.signatory);
  const [error, setError] = useState("");

  const signed = !!draft.agreement.signedAt;
  const expected = draft.business.signatoryName.trim();

  function handleSign() {
    if (typed.trim().toLowerCase() !== expected.toLowerCase()) {
      setError(t("agreement.mismatch"));
      return false;
    }
    patch({
      agreement: {
        version: AGREEMENT_VERSION,
        signatory: typed.trim(),
        signedAt: new Date().toISOString(),
      },
    });
    return true;
  }

  return (
    <StepShell
      routeId="agreement"
      title={t("agreement.title")}
      subtitle={t("agreement.subtitle")}
      continueLabel={signed ? t("common.continue") : t("agreement.sign")}
      continueDisabled={!signed && (!readToEnd || !typed.trim())}
      onContinue={() => (signed ? true : handleSign())}
    >
      <p className="flex items-center gap-2 text-xs text-ink-mute">
        <ScrollText className="size-3.5" aria-hidden />
        {t("agreement.version", { v: AGREEMENT_VERSION })}
      </p>

      <div
        ref={scrollRef}
        tabIndex={0}
        role="region"
        aria-label={t("agreement.title")}
        onScroll={(e) => {
          const el = e.currentTarget;
          if (el.scrollHeight - el.scrollTop - el.clientHeight < 40) setReadToEnd(true);
        }}
        className="scroll-thin h-72 overflow-y-auto rounded-tile border border-line bg-paper p-4 text-sm leading-relaxed text-ink-soft"
      >
        {AGREEMENT_CLAUSES.map((clause, i) => (
          <section key={i} className="mb-4 last:mb-0">
            <h3 className="mb-1 text-sm font-semibold text-ink">
              {i + 1}. {clause.heading}
            </h3>
            <p className="whitespace-pre-line">
              {clause.body
                .replace("{commission}", pct(draft.commercials.commissionPct))
                .replace("{wht}", pct(draft.commercials.whtPct))
                .replace("{fee}", money(draft.commercials.convenienceFeeCents, locale))
                .replace("{cycle}", draft.commercials.settlementCycle)
                .replace("{entity}", draft.business.legalName || draft.account.businessName)}
            </p>
          </section>
        ))}
        <p className="mt-6 border-t border-line pt-3 text-xs text-ink-faint">
          End of agreement — version {AGREEMENT_VERSION}.
        </p>
      </div>

      {!readToEnd && !signed && (
        <p className="text-xs text-ink-mute">{t("agreement.scrollHint")}</p>
      )}

      {signed ? (
        <div className="rounded-tile border border-lime-deep/40 bg-lime-tint/50 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-ink">
            <BadgeCheck className="size-5 text-ok" aria-hidden />
            {t("agreement.signed", {
              date: dateTime(draft.agreement.signedAt!, locale),
              name: draft.agreement.signatory,
            })}
          </p>
          <p className="mt-1 text-xs text-ink-mute">
            {t("agreement.version", { v: draft.agreement.version })}
          </p>
        </div>
      ) : (
        <Input
          label={t("agreement.signLabel")}
          hint={t("agreement.signHint", { name: expected || "—" })}
          required
          disabled={!readToEnd}
          value={typed}
          onChange={(e) => {
            setTyped(e.target.value);
            setError("");
          }}
          error={error}
          className="font-display"
        />
      )}
    </StepShell>
  );
}
