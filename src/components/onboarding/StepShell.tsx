"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Cloud } from "lucide-react";
import { useT } from "@/lib/i18n/useT";
import { useOnboardingStore } from "@/lib/stores/onboardingStore";
import { completionOf, routeNeighbours } from "@/lib/onboardingSteps";
import { saveDraft } from "@/lib/services/onboardingService";
import { ChecklistRail } from "./ChecklistRail";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/**
 * The frame every wizard step uses: progress, title, autosave indicator and
 * Back/Continue. One decision per screen, airy, 44px touch targets.
 */
export function StepShell({
  routeId,
  title,
  subtitle,
  children,
  onContinue,
  continueLabel,
  continueDisabled,
  continueLoading,
  hideContinue,
  notice,
}: {
  /** Matches a `wizardRoutes()` id — e.g. "business" or "setup:dining". */
  routeId: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Return false to block navigation (validation failed). */
  onContinue?: () => boolean | Promise<boolean>;
  continueLabel?: string;
  continueDisabled?: boolean;
  continueLoading?: boolean;
  hideContinue?: boolean;
  notice?: ReactNode;
}) {
  const { t } = useT();
  const router = useRouter();
  const draft = useOnboardingStore((s) => s.draft);
  const hydrated = useOnboardingStore((s) => s.hydrated);
  const setLastStep = useOnboardingStore((s) => s.setLastStep);
  const [busy, setBusy] = useState(false);

  const { prev, next, index, total } = routeNeighbours(draft, routeId);
  const pct = completionOf(draft);

  // Resume lands on `lastStep`, so every visit records where the applicant is.
  useEffect(() => {
    if (hydrated) setLastStep(routeId.split(":")[0]);
  }, [hydrated, routeId, setLastStep]);

  async function handleContinue() {
    setBusy(true);
    try {
      if (onContinue) {
        const ok = await onContinue();
        if (!ok) return;
      }
      await saveDraft(useOnboardingStore.getState().draft);
      if (next) router.push(next.href);
    } finally {
      setBusy(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="skeleton h-4 w-32 rounded-chip" />
        <div className="skeleton mt-4 h-10 w-3/4 rounded-tile" />
        <div className="skeleton mt-6 h-64 w-full rounded-tile" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl gap-8 px-4 py-6 lg:py-10">
      <div className="min-w-0 flex-1 lg:max-w-2xl">
        {/* Progress — a bar on mobile, the rail carries it on desktop. */}
        <div className="mb-5">
          <div className="mb-1.5 flex items-center justify-between text-xs text-ink-mute">
            <span>{t("common.step", { n: index + 1, total })}</span>
            <span className="tabular-nums">
              {pct}% {t("common.complete")}
            </span>
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-chip bg-sand"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t("rail.title")}
          >
            <div
              className="h-full rounded-chip bg-lime-deep transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <header className="anim-rise mb-5">
          <h1 className="font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-sm leading-relaxed text-ink-mute">{subtitle}</p>}
        </header>

        {notice && <div className="mb-5">{notice}</div>}

        <div className="anim-rise anim-delay-1 flex flex-col gap-5">{children}</div>

        {/* Nav. Sticky on mobile so Continue is always in thumb reach. */}
        <div
          className={cn(
            "sticky bottom-0 -mx-4 mt-8 flex items-center gap-3 border-t border-line bg-cream/95 px-4 py-3 backdrop-blur",
            "sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:backdrop-blur-none",
          )}
        >
          {prev && (
            <Button
              variant="secondary"
              href={prev.href}
              icon={<ArrowLeft className="size-4" />}
              aria-label={t("common.back")}
            >
              <span className="hidden sm:inline">{t("common.back")}</span>
            </Button>
          )}
          {!hideContinue && (
            <Button
              onClick={handleContinue}
              loading={busy || continueLoading}
              disabled={continueDisabled}
              full
              size="lg"
              className="flex-1"
            >
              {continueLabel ?? t("common.continue")}
              <ArrowRight className="size-4" />
            </Button>
          )}
        </div>

        <SaveIndicator />
      </div>

      <ChecklistRail currentRouteId={routeId} className="hidden lg:block" />
    </div>
  );
}

/** "Saved just now" — the reassurance that lets someone close the tab. */
function SaveIndicator() {
  const savedAt = useOnboardingStore((s) => s.draft.savedAt);
  const { t } = useT();
  // The icon settles from "saving" to "saved" two seconds after each write.
  // Tracked as state rather than computed from the clock, so render stays pure.
  const [settledAt, setSettledAt] = useState<string | undefined>();

  useEffect(() => {
    if (!savedAt) return;
    const id = setTimeout(() => setSettledAt(savedAt), 2000);
    return () => clearTimeout(id);
  }, [savedAt]);

  if (!savedAt) return null;
  const fresh = settledAt !== savedAt;

  return (
    <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-faint">
      {fresh ? (
        <Cloud className="size-3.5 animate-pulse" aria-hidden />
      ) : (
        <Check className="size-3.5 text-ok" aria-hidden />
      )}
      {t("common.saved")}
    </p>
  );
}
