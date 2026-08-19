"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Pencil, Send } from "lucide-react";
import { StepShell } from "@/components/onboarding/StepShell";
import { useT } from "@/lib/i18n/useT";
import { useOnboardingStore } from "@/lib/stores/onboardingStore";
import { blockers, stepById, wizardRoutes } from "@/lib/onboardingSteps";
import { NotConnectedError, submitApplication } from "@/lib/services/onboardingService";
import { documentsFor } from "@/lib/srilanka";
import { formatPhone } from "@/lib/srilanka";
import { money, pct, dateTime } from "@/lib/format";
import { VERTICAL_LABEL } from "@/components/ui/StatusBadge";
import type { DictKey } from "@/lib/i18n/config";

export default function ReviewPage() {
  const { t, locale } = useT();
  const router = useRouter();
  const draft = useOnboardingStore((s) => s.draft);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const problems = blockers(draft);
  const blocked = problems.length > 0;
  const routes = wizardRoutes(draft);

  /** Jump straight to the step that owns a blocking item. */
  const hrefFor = (stepId: string) =>
    routes.find((r) => r.stepId === stepId)?.href ?? stepById(stepId)?.href ?? "/onboarding";

  async function handleSubmit() {
    if (blocked) return false;
    setSubmitting(true);
    setSubmitError("");
    try {
      await submitApplication(draft);
      return true;
    } catch (e) {
      setSubmitError(
        e instanceof NotConnectedError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Could not submit.",
      );
      router.push("/onboarding/submitted");
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  const docs = documentsFor(draft.verticals, draft.flags);
  const uploaded = docs.filter((d) => draft.documents[d.type]).length;

  return (
    <StepShell
      routeId="review"
      title={t("review.title")}
      subtitle={t("review.subtitle")}
      continueLabel={t("review.submit")}
      continueDisabled={blocked}
      continueLoading={submitting}
      onContinue={handleSubmit}
    >
      {blocked ? (
        <section className="rounded-tile border border-coral/40 bg-coral-tint/40 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <AlertCircle className="size-4 text-coral" aria-hidden />
            {t("review.incomplete", { n: problems.reduce((n, p) => n + p.items.length, 0) })}
          </p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {problems.map(({ step, items }) => (
              <li key={step.id}>
                <Link
                  href={hrefFor(step.id)}
                  className="text-sm font-medium text-ink underline underline-offset-2"
                >
                  {t(step.labelKey)}
                </Link>
                <ul className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                  {items.map((item) => (
                    <li key={item} className="text-xs text-ink-soft">
                      · {item}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="flex items-center gap-2 rounded-tile border border-lime-deep/40 bg-lime-tint/50 px-4 py-3 text-sm font-medium text-ink">
          <CheckCircle2 className="size-4 text-ok" aria-hidden />
          {t("review.complete")}
        </p>
      )}

      <Section titleKey="review.section.account" href={hrefFor("signup")}>
        <Row label={t("signup.businessName")} value={draft.account.businessName} />
        <Row label={t("signup.contactName")} value={draft.account.contactName} />
        <Row label={t("signup.email")} value={draft.account.email} />
        <Row label={t("signup.phone")} value={formatPhone(draft.account.phone)} />
      </Section>

      <Section titleKey="review.section.setup" href={hrefFor("verticals")}>
        <Row
          label={t("verticals.title")}
          value={draft.verticals.map((v) => VERTICAL_LABEL[v]).join(" · ") || "—"}
        />
        <Row label={t("verticals.district")} value={`${draft.district} · ${draft.province}`} />
        {draft.verticals.map((v) => (
          <Row key={v} label={`${VERTICAL_LABEL[v]} scale`} value={draft.scale[v] ?? "—"} />
        ))}
      </Section>

      <Section titleKey="review.section.business" href={hrefFor("business")}>
        <Row label={t("business.legalName")} value={draft.business.legalName} />
        <Row label={t("business.brn")} value={draft.business.brn} />
        <Row label={t("business.tin")} value={draft.business.tin} />
        {draft.flags.vatRegistered && (
          <Row label={t("business.vat")} value={draft.business.vatNumber || "—"} />
        )}
        <Row label={t("business.address")} value={draft.business.registeredAddress} />
        <Row label={t("business.signatoryName")} value={draft.business.signatoryName} />
        <Row label={t("business.nic")} value={draft.business.signatoryNic} />
      </Section>

      <Section titleKey="review.section.documents" href={hrefFor("documents")}>
        <Row
          label={t("docs.title")}
          value={t("docs.progress", { done: uploaded, total: docs.length })}
        />
        <ul className="mt-1 flex flex-col gap-1">
          {docs.map((spec) => {
            const doc = draft.documents[spec.type];
            return (
              <li key={spec.type} className="flex items-start justify-between gap-3 text-xs">
                <span className="text-ink-mute">{spec.label}</span>
                <span
                  className={
                    doc && doc.status !== "rejected" ? "shrink-0 text-ok" : "shrink-0 text-danger"
                  }
                >
                  {doc ? (doc.status === "rejected" ? t("docs.rejected") : t("docs.pending")) : t("docs.missing")}
                </span>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section titleKey="review.section.bank" href={hrefFor("bank")}>
        <Row label={t("bank.accountName")} value={draft.bank.accountName} />
        <Row
          label={t("bank.accountNumber")}
          value={draft.bank.accountNumber ? `••••${draft.bank.accountNumber.slice(-4)}` : "—"}
        />
        <Row
          label={t("bank.bank")}
          value={
            draft.bank.bankName ? `${draft.bank.bankName} · ${draft.bank.branchName}` : "—"
          }
        />
        <Row
          label={t("bank.verify")}
          value={draft.bank.pennyDropStatus === "verified" ? t("bank.verified") : t("docs.pending")}
        />
      </Section>

      <Section titleKey="review.section.commercials" href={hrefFor("commercials")}>
        <Row label={t("commercials.commission")} value={pct(draft.commercials.commissionPct)} />
        <Row
          label={t("commercials.convenienceFee")}
          value={money(draft.commercials.convenienceFeeCents, locale)}
        />
        <Row label={t("commercials.cycle")} value={draft.commercials.settlementCycle} />
        <Row label={t("commercials.wht")} value={pct(draft.commercials.whtPct)} />
      </Section>

      <Section titleKey="review.section.agreement" href={hrefFor("agreement")}>
        {draft.agreement.signedAt ? (
          <Row
            label={t("agreement.title")}
            value={t("agreement.signed", {
              date: dateTime(draft.agreement.signedAt, locale),
              name: draft.agreement.signatory,
            })}
          />
        ) : (
          <Row label={t("agreement.title")} value="—" />
        )}
      </Section>

      {blocked && (
        <p role="alert" className="text-sm text-danger">
          {t("review.blocked")}
        </p>
      )}

      {submitError && (
        <p role="alert" className="rounded-tile border border-peach/50 bg-peach-tint/40 px-3 py-2 text-sm leading-relaxed text-ink">
          {submitError}
        </p>
      )}

      <p className="flex items-center gap-1.5 text-xs text-ink-faint">
        <Send className="size-3.5" aria-hidden />
        {t("submitted.step1")}
      </p>
    </StepShell>
  );
}

function Section({
  titleKey,
  href,
  children,
}: {
  titleKey: DictKey;
  href: string;
  children: React.ReactNode;
}) {
  const { t } = useT();
  return (
    <section className="rounded-tile border border-line bg-paper p-4">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <h2 className="font-display text-sm font-semibold text-ink">{t(titleKey)}</h2>
        <Link
          href={href}
          className="inline-flex items-center gap-1 rounded-chip border border-line px-2.5 py-1 text-xs font-medium text-ink-soft hover:bg-cream-deep hover:text-ink"
        >
          <Pencil className="size-3" aria-hidden />
          {t("common.edit")}
        </Link>
      </div>
      <dl className="flex flex-col gap-1.5">{children}</dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <dt className="shrink-0 text-ink-mute">{label}</dt>
      <dd className="min-w-0 break-words text-right text-ink">{value || "—"}</dd>
    </div>
  );
}
