"use client";

import Link from "next/link";
import { Construction, Plug, Ship, PartyPopper, Utensils } from "lucide-react";
import { useT } from "@/lib/i18n/useT";
import { cn } from "@/lib/cn";

/**
 * Partner onboarding is not connected.
 *
 * The wizard behind this screen is built and working — it captures a full
 * application and persists it — but the Ceylo backend has no partner
 * application endpoints, so there is nowhere to send one. Rather than walk an
 * applicant through twenty minutes of forms that end in nothing, the entry
 * point says so up front.
 *
 * The wizard routes are still in the codebase and still reachable directly
 * (/onboarding/signup and onwards). When the endpoints below exist, wire
 * `submitApplication` in lib/services/onboardingService.ts and restore the
 * start button here.
 */
export default function OnboardingComingSoonPage() {
  const { t } = useT();

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

      <section className="anim-rise anim-delay-2 mt-8 rounded-tile border border-line bg-paper p-6 shadow-tile">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-peach-tint">
          <Construction className="size-5 text-peach" aria-hidden />
        </span>

        <h2 className="mt-3 font-display text-lg font-semibold text-ink">
          Applications are not open yet
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          We are still connecting partner sign-up to our systems. You cannot submit an application
          today, and we would rather tell you that than have you fill in twenty minutes of forms
          that go nowhere.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-mute">
          Call us on +94 11 234 5678 or email partners@ceylo.lk and we will take your details and
          come back to you as soon as this opens.
        </p>

        <div className="mt-5 rounded-tile border border-line bg-sand-soft/60 p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-mute">
            <Plug className="size-3" aria-hidden />
            Needs from the API
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
          <p className="mt-2.5 text-[11px] leading-relaxed text-ink-mute">
            The wizard itself is built and waiting — language gate, business identity, the Sri Lanka
            document matrix, bank verification, per-vertical setup, commercials and e-sign. Only the
            submit step is missing.
          </p>
        </div>
      </section>

      <p className="anim-rise anim-delay-3 mt-6 text-center text-xs text-ink-mute">
        Ceylo staff?{" "}
        <Link href="/admin/login" className="underline underline-offset-2 hover:text-ink">
          Sign in to the admin console
        </Link>
      </p>
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
