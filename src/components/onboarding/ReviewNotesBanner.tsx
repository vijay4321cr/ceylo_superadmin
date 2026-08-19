"use client";

import { AlertCircle } from "lucide-react";
import { useT } from "@/lib/i18n/useT";
import { useOnboardingStore } from "@/lib/stores/onboardingStore";
import { docLabel } from "@/lib/srilanka";
import type { DocumentType } from "@/lib/types";

/**
 * The "changes requested" loop, applicant side. Ops writes itemised notes
 * against named fields; this renders them inline on the step that owns them,
 * so the applicant never has to guess what to fix.
 */
export function ReviewNotesBanner({ prefix }: { prefix: string }) {
  const { t } = useT();
  const notes = useOnboardingStore((s) => s.draft.reviewNotes);

  const mine = notes.filter((n) => {
    if (n.resolvedAt) return false;
    if (prefix === "documents") return !n.field.includes(".");
    return n.field.startsWith(`${prefix}.`);
  });

  if (!mine.length) return null;

  return (
    <div className="rounded-tile border border-coral/40 bg-coral-tint/50 p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-ink">
        <AlertCircle className="size-4 text-coral" aria-hidden />
        {t("submitted.changesRequested")}
      </p>
      <ul className="mt-2 flex flex-col gap-2">
        {mine.map((n, i) => (
          <li key={i} className="text-sm text-ink-soft">
            <span className="font-medium text-ink">{fieldLabel(n.field)}</span>
            <span className="mx-1.5 text-ink-faint">—</span>
            {n.note}
          </li>
        ))}
      </ul>
    </div>
  );
}

function fieldLabel(field: string): string {
  if (field.includes(".")) {
    const leaf = field.split(".").pop() ?? field;
    return leaf.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
  }
  return docLabel(field as DocumentType);
}
