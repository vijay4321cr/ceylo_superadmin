"use client";

import Link from "next/link";
import { Phone, Plug, Save } from "lucide-react";
import { useT } from "@/lib/i18n/useT";
import { useOnboardingStore } from "@/lib/stores/onboardingStore";
import { completionOf } from "@/lib/onboardingSteps";
import { Button } from "@/components/ui/Button";

/**
 * The wizard is complete but there is nowhere to send it: the Ceylo backend
 * has no partner application endpoint yet. Rather than show a fake reference
 * number, this says plainly what happened to the answers.
 */
export default function SubmittedPage() {
  const { t } = useT();
  const draft = useOnboardingStore((s) => s.draft);
  const hydrated = useOnboardingStore((s) => s.hydrated);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14">
        <div className="skeleton h-10 w-2/3 rounded-tile" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <div className="anim-rise">
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-peach-tint">
          <Save className="size-5 text-peach" aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink sm:text-3xl">
          Your answers are saved
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-mute">
          You have completed {completionOf(draft)}% of the application, and everything you typed is
          stored in this browser. Nothing has been sent to Ceylo yet — the application cannot be
          submitted until the backend can receive it.
        </p>
      </div>

      <section className="anim-rise anim-delay-1 mt-6 rounded-tile border border-line bg-paper p-4">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-mute">
          <Plug className="size-3" aria-hidden />
          What the API needs to expose
        </p>
        <ul className="mt-2 flex flex-col gap-1">
          {["POST /partner/register", "POST /partner/restaurant", "POST /partner/kyc/submit"].map(
            (e) => (
              <li key={e} className="font-mono text-[11px] text-ink-soft">
                {e}
              </li>
            ),
          )}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-ink-mute">
          Once those exist, this step sends the draft you have already filled in — you will not have
          to type any of it again.
        </p>
      </section>

      <div className="mt-6 flex flex-col gap-2.5">
        <Button variant="secondary" href="/onboarding/review">
          {t("review.title")}
        </Button>
        <Link
          href="/onboarding"
          className="text-center text-xs text-ink-mute underline underline-offset-2 hover:text-ink"
        >
          {t("common.back")}
        </Link>
      </div>

      <p className="mt-8 flex items-center gap-2 border-t border-line pt-5 text-xs text-ink-mute">
        <Phone className="size-3.5" aria-hidden />
        {t("submitted.contact")}
      </p>
    </div>
  );
}
