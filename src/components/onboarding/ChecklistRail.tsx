"use client";

import Link from "next/link";
import { Check, Circle, CircleDot, AlertCircle } from "lucide-react";
import { useT } from "@/lib/i18n/useT";
import { useOnboardingStore } from "@/lib/stores/onboardingStore";
import { completionOf, firstIncompleteStep, stepById, wizardRoutes } from "@/lib/onboardingSteps";
import { VERTICAL_LABEL } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";

/**
 * Persistent % complete + what to do next. On mobile the StepShell's progress
 * bar carries this job instead, so the rail is desktop-only.
 */
export function ChecklistRail({
  currentRouteId,
  className,
}: {
  currentRouteId?: string;
  className?: string;
}) {
  const { t } = useT();
  const draft = useOnboardingStore((s) => s.draft);
  const routes = wizardRoutes(draft);
  const pct = completionOf(draft);
  const nextStep = firstIncompleteStep(draft);
  const allDone = pct === 100;

  /** A note against any field inside this step means Ops pushed it back. */
  const noteSteps = new Set(
    draft.reviewNotes
      .filter((n) => !n.resolvedAt)
      .map((n) => (n.field.includes(".") ? n.field.split(".")[0] : "documents")),
  );

  return (
    <aside className={cn("w-60 shrink-0", className)} aria-label={t("rail.title")}>
      <div className="sticky top-20 rounded-tile border border-line bg-paper p-4 shadow-tile">
        <p className="font-display text-sm font-semibold text-ink">{t("rail.title")}</p>

        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="font-display text-2xl font-semibold tabular-nums text-ink">{pct}%</span>
          <span className="text-xs text-ink-mute">{t("common.complete")}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-chip bg-sand">
          <div
            className="h-full rounded-chip bg-lime-deep transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <p className="mt-3 text-xs text-ink-mute">
          {allDone ? t("rail.allDone") : t("rail.next", { step: t(nextStep.labelKey) })}
        </p>

        <ol className="mt-4 flex flex-col gap-0.5 border-t border-line-soft pt-3">
          {routes.map((route) => {
            const step = stepById(route.stepId)!;
            const done = step.isComplete(draft);
            const current = route.id === currentRouteId;
            const flagged = noteSteps.has(route.stepId);

            return (
              <li key={route.id}>
                <Link
                  href={route.href}
                  aria-current={current ? "step" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                    current ? "bg-cream-deep font-medium text-ink" : "text-ink-mute hover:bg-cream-deep",
                  )}
                >
                  {flagged ? (
                    <AlertCircle className="size-3.5 shrink-0 text-coral" aria-hidden />
                  ) : done ? (
                    <Check className="size-3.5 shrink-0 text-ok" aria-hidden />
                  ) : current ? (
                    <CircleDot className="size-3.5 shrink-0 text-ink" aria-hidden />
                  ) : (
                    <Circle className="size-3.5 shrink-0 text-ink-faint" aria-hidden />
                  )}
                  <span className="truncate">
                    {t(route.labelKey)}
                    {route.vertical && (
                      <span className="ml-1 text-ink-faint">· {VERTICAL_LABEL[route.vertical]}</span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
}
