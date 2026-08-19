import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, ShieldCheck } from "lucide-react";

/**
 * Front door. In production these are separate sub-domains
 * (`partner.ceylo.app` and `admin.ceylo.app`) so their sessions never cross —
 * this page only exists because the demo runs both from one origin.
 */
export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-cream px-4 py-16">
      <div className="w-full max-w-4xl">
        <p className="font-display text-3xl font-semibold tracking-tight">Ceylo</p>
        <p className="mt-2 text-sm text-ink-mute">
          Sri Lanka&rsquo;s booking marketplace — dining, ferries and events.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            href="/onboarding"
            icon={<Building2 className="size-5 text-coral" aria-hidden />}
            title="Partner onboarding"
            body="Apply to list your business. Sinhala, Tamil and English. Mobile-first."
            cta="Start an application"
          />

          <Card
            href="/admin/login"
            icon={<ShieldCheck className="size-5 text-sky" aria-hidden />}
            title="Ceylo admin console"
            body="Staff only. Review applications, run settlements, govern the marketplace."
            cta="Staff sign in"
            delay="anim-delay-1"
          />

          {/* The one live surface — everything else runs on the mock layer. */}
          <Card
            href="/admin/approvals"
            icon={<BadgeCheck className="size-5 text-ok" aria-hidden />}
            title="Partner approvals"
            body="Approve partners who already registered and submitted KYC. Reads and writes the real CYLO backend."
            cta="Sign in and review requests"
            delay="anim-delay-2"
            tag="Live API"
          />
        </div>

        <p className="mt-6 text-xs leading-relaxed text-ink-mute">
          The console signs in against the live Ceylo backend with a phone number that holds an
          admin role. No backend to hand? Run <code className="font-mono">npm run api:stub</code> and
          point <code className="font-mono">CYLO_API_ORIGIN</code> at it.
        </p>
      </div>
    </div>
  );
}

function Card({
  href,
  icon,
  title,
  body,
  cta,
  delay,
  tag,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
  delay?: string;
  tag?: string;
}) {
  return (
    <Link
      href={href}
      className={`anim-rise ${delay ?? ""} group flex flex-col rounded-tile border border-line bg-paper p-5 shadow-tile transition hover:border-ink`}
    >
      <span className="flex items-center gap-2">
        {icon}
        {tag && (
          <span className="ml-auto rounded-chip bg-ok-tint px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink">
            {tag}
          </span>
        )}
      </span>
      <p className="mt-3 font-display text-base font-semibold">{title}</p>
      <p className="mt-1 flex-1 text-xs leading-relaxed text-ink-mute">{body}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-ink">
        {cta}
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
