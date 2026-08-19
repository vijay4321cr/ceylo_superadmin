"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Utensils, Ship, PartyPopper } from "lucide-react";
import { useLocaleStore } from "@/lib/stores/localeStore";
import { useOnboardingStore } from "@/lib/stores/onboardingStore";
import { useT } from "@/lib/i18n/useT";
import { LOCALES } from "@/lib/i18n/config";
import { completionOf, firstIncompleteStep } from "@/lib/onboardingSteps";
import { resumeHref } from "@/lib/services/onboardingService";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/types";

/**
 * The language gate. It comes before anything else, because the person filling
 * this in may not read English — that is the whole point of the surface.
 */
export default function OnboardingStartPage() {
  const router = useRouter();
  const { t } = useT();
  const locale = useLocaleStore((s) => s.locale);
  const chosen = useLocaleStore((s) => s.chosen);
  const localeHydrated = useLocaleStore((s) => s.hydrated);

  const draft = useOnboardingStore((s) => s.draft);
  const hydrated = useOnboardingStore((s) => s.hydrated);

  // Only skip the gate once the applicant has actively picked a language.
  const [showGate, setShowGate] = useState(!chosen);

  if (!hydrated || !localeHydrated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="skeleton h-10 w-2/3 rounded-tile" />
        <div className="skeleton mt-4 h-40 w-full rounded-tile" />
      </div>
    );
  }

  if (showGate && !chosen) {
    return <LanguageGate onDone={() => setShowGate(false)} />;
  }

  const started = !!draft.account.businessName || draft.verticals.length > 0;
  const pct = completionOf(draft);
  const next = firstIncompleteStep(draft);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <div className="anim-rise">
        <h1 className="font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          {t("start.title")}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-mute">{t("start.subtitle")}</p>
      </div>

      <div className="anim-rise anim-delay-1 mt-7 grid gap-3 sm:grid-cols-3">
        <VerticalCard icon={<Utensils className="size-5" />} label={t("verticals.dining")} tint="coral" />
        <VerticalCard icon={<Ship className="size-5" />} label={t("verticals.ferry")} tint="sky" />
        <VerticalCard icon={<PartyPopper className="size-5" />} label={t("verticals.event")} tint="violet" />
      </div>

      <ul className="anim-rise anim-delay-2 mt-7 flex flex-col gap-2.5">
        {[t("start.point1"), t("start.point2"), t("start.point3")].map((point) => (
          <li key={point} className="flex items-start gap-2.5 text-sm text-ink-soft">
            <Check className="mt-0.5 size-4 shrink-0 text-lime-deep" aria-hidden />
            {point}
          </li>
        ))}
      </ul>

      <div className="anim-rise anim-delay-3 mt-8 flex flex-col gap-3">
        {started ? (
          <>
            <Button
              size="lg"
              full
              onClick={() => router.push(resumeHref(draft))}
              icon={<ArrowRight className="size-4" />}
            >
              {t("start.resume")}
            </Button>
            <p className="text-center text-xs text-ink-mute">
              {t("start.resumeHint", { pct, step: t(next.labelKey) })}
            </p>
          </>
        ) : (
          <Button size="lg" full href="/onboarding/signup" icon={<ArrowRight className="size-4" />}>
            {t("start.begin")}
          </Button>
        )}

        <button
          type="button"
          onClick={() => setShowGate(true)}
          className="text-center text-xs text-ink-mute underline underline-offset-2 hover:text-ink"
        >
          {LOCALES.find((l) => l.code === locale)?.native} · {t("lang.title")}
        </button>
      </div>
    </div>
  );
}

function LanguageGate({ onDone }: { onDone: () => void }) {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const { t } = useT();
  const [picked, setPicked] = useState<Locale>(locale);

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="anim-rise text-center">
        <p className="font-display text-2xl font-semibold tracking-tight">Ceylo</p>
        <h1 className="mt-6 font-display text-xl font-semibold text-ink">{t("lang.title")}</h1>
        <p className="mt-1.5 text-sm text-ink-mute">{t("lang.subtitle")}</p>
      </div>

      <div className="anim-rise anim-delay-1 mt-7 flex flex-col gap-2.5">
        {LOCALES.map((l) => {
          const active = picked === l.code;
          return (
            <button
              key={l.code}
              type="button"
              lang={l.code}
              onClick={() => {
                setPicked(l.code);
                setLocale(l.code);
              }}
              aria-pressed={active}
              className={cn(
                "flex items-center justify-between rounded-tile border px-4 py-4 text-left transition",
                active ? "border-ink bg-cream-deep" : "border-line bg-paper hover:bg-cream-deep/60",
              )}
            >
              <span>
                <span className="block text-lg font-medium text-ink">{l.native}</span>
                <span className="block text-xs text-ink-mute">{l.english}</span>
              </span>
              {active && <Check className="size-5 text-ink" aria-hidden />}
            </button>
          );
        })}
      </div>

      <Button size="lg" full className="anim-rise anim-delay-2 mt-6" onClick={onDone}>
        {t("lang.continue")}
      </Button>
    </div>
  );
}

function VerticalCard({
  icon,
  label,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  tint: "coral" | "sky" | "violet";
}) {
  const tints = {
    coral: "border-coral/30 bg-coral-tint/50 text-coral",
    sky: "border-sky/30 bg-sky-tint/50 text-sky",
    violet: "border-violet/30 bg-violet-tint/50 text-violet",
  };
  return (
    <div className={cn("flex items-center gap-2.5 rounded-tile border p-3.5", tints[tint])}>
      {icon}
      <span className="text-sm font-medium text-ink">{label}</span>
    </div>
  );
}
