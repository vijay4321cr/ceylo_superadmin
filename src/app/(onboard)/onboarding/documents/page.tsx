"use client";

import { useMemo, useState } from "react";
import { StepShell } from "@/components/onboarding/StepShell";
import { DocUpload } from "@/components/onboarding/DocUpload";
import { ReviewNotesBanner } from "@/components/onboarding/ReviewNotesBanner";
import { useT } from "@/lib/i18n/useT";
import { useOnboardingStore } from "@/lib/stores/onboardingStore";
import { COMMON_DOCS, VERTICAL_DOCS, documentsFor } from "@/lib/srilanka";
import { VERTICAL_LABEL } from "@/components/ui/StatusBadge";
import { useNow } from "@/lib/useNow";

export default function DocumentsPage() {
  const { t } = useT();
  const draft = useOnboardingStore((s) => s.draft);
  const now = useNow();
  const [showErrors, setShowErrors] = useState(false);

  const readOnly = draft.status === "submitted" || draft.status === "under_review";

  // The checklist is derived from the verticals chosen in Phase 1 plus the
  // conditional flags from Phase 2 — a dining-only applicant is never asked
  // for a seaworthiness certificate.
  const required = useMemo(() => documentsFor(draft.verticals, draft.flags), [draft.verticals, draft.flags]);
  const requiredTypes = new Set(required.map((d) => d.type));

  const done = required.filter((spec) => {
    const doc = draft.documents[spec.type];
    if (!doc || doc.status === "rejected") return false;
    if (spec.dateBound && !doc.expiresAt) return false;
    if (doc.expiresAt && new Date(doc.expiresAt).getTime() < now) return false;
    return true;
  }).length;

  const commonVisible = COMMON_DOCS.filter((d) => requiredTypes.has(d.type));

  return (
    <StepShell
      routeId="documents"
      title={t("docs.title")}
      subtitle={t("docs.subtitle")}
      continueDisabled={readOnly}
      onContinue={() => {
        const blocked = required.some((spec) => {
          if (!spec.required) return false;
          const doc = draft.documents[spec.type];
          if (!doc || doc.status === "rejected") return true;
          if (spec.dateBound && !doc.expiresAt) return true;
          if (doc.expiresAt && new Date(doc.expiresAt).getTime() < Date.now()) return true;
          return false;
        });
        setShowErrors(blocked);
        return !blocked;
      }}
      notice={<ReviewNotesBanner prefix="documents" />}
    >
      <div className="flex items-center justify-between rounded-tile border border-line bg-sand-soft/60 px-3.5 py-2.5">
        <span className="text-xs font-medium text-ink-soft">
          {t("docs.progress", { done, total: required.length })}
        </span>
        <div className="h-1.5 w-24 overflow-hidden rounded-chip bg-sand">
          <div
            className="h-full rounded-chip bg-lime-deep transition-all"
            style={{ width: `${required.length ? (done / required.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <DocGroup title="Business & identity" specs={commonVisible} readOnly={readOnly} />

      {draft.verticals.map((v) => {
        const specs = VERTICAL_DOCS[v].filter((d) => requiredTypes.has(d.type));
        if (!specs.length) return null;
        return (
          <DocGroup
            key={v}
            title={VERTICAL_LABEL[v]}
            specs={specs}
            readOnly={readOnly}
            accent={v}
          />
        );
      })}

      {showErrors && (
        <p role="alert" className="text-sm text-danger">
          {t("review.blocked")}
        </p>
      )}
    </StepShell>
  );
}

function DocGroup({
  title,
  specs,
  readOnly,
  accent,
}: {
  title: string;
  specs: ReturnType<typeof documentsFor>;
  readOnly: boolean;
  accent?: string;
}) {
  const dot: Record<string, string> = {
    dining: "bg-coral",
    ferry: "bg-sky",
    event: "bg-violet",
  };
  return (
    <section>
      <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
        {accent && <span className={`size-2 rounded-full ${dot[accent]}`} aria-hidden />}
        {title}
      </h2>
      <ul className="flex flex-col gap-2.5">
        {specs.map((spec) => (
          <DocUpload key={spec.type} spec={spec} readOnly={readOnly} />
        ))}
      </ul>
    </section>
  );
}
