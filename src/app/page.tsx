import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Front door. Each card says plainly whether there is a backend behind it, so
 * nothing here looks more finished than it is.
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
            href="/admin/login"
            icon={<ShieldCheck className="size-5 text-sky" aria-hidden />}
            title="Ceylo admin console"
            body="Staff only. Sign in with a phone number that holds an admin role on the Ceylo backend."
            cta="Staff sign in"
            tag="Live API"
          />

          <Card
            href="/admin/approvals"
            icon={<BadgeCheck className="size-5 text-ok" aria-hidden />}
            title="Partner approvals"
            body="Approve partners who already registered and submitted KYC. Reads and writes the real Ceylo backend."
            cta="Sign in and review requests"
            delay="anim-delay-1"
            tag="Live API"
          />

          <Card
            href="/onboarding"
            icon={<Building2 className="size-5 text-ink-faint" aria-hidden />}
            title="Partner onboarding"
            body="The applicant wizard is built — trilingual, mobile-first — but there is no partner application endpoint yet, so applications are not open."
            cta="See what is missing"
            delay="anim-delay-2"
            tag="Coming soon"
            muted
          />
        </div>

        <p className="mt-6 text-xs leading-relaxed text-ink-mute">
          The console signs in against the Ceylo backend with a phone number that holds an admin
          role. Every environment calls the same API —{" "}
          <code className="font-mono">ceylo-backend.onrender.com/api/v1</code>.
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
  muted,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
  delay?: string;
  tag?: string;
  /** Nothing behind it yet — say so rather than let it look ready. */
  muted?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "anim-rise group flex flex-col rounded-tile border bg-paper p-5 shadow-tile transition hover:border-ink",
        muted ? "border-dashed border-line" : "border-line",
        delay,
      )}
    >
      <span className="flex items-center gap-2">
        {icon}
        {tag && (
          <span
            className={cn(
              "ml-auto rounded-chip px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              muted ? "bg-sand text-ink-mute" : "bg-ok-tint text-ink",
            )}
          >
            {tag}
          </span>
        )}
      </span>
      <p className={cn("mt-3 font-display text-base font-semibold", muted && "text-ink-soft")}>
        {title}
      </p>
      <p className="mt-1 flex-1 text-xs leading-relaxed text-ink-mute">{body}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-ink">
        {cta}
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
