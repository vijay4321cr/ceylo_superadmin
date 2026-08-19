"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { useStaffAuthStore } from "@/lib/stores/staffAuthStore";
import {
  capabilityForPath,
  staffCan,
  staffNavItems,
  ROLE_SHORT,
  LIVE_ROUTES,
} from "@/lib/staffRbac";
import { API_ORIGIN_LABEL } from "@/lib/api/client";
import { cn } from "@/lib/cn";

/**
 * The staff frame. Desktop-only by design — staff work at desks, and effort
 * spent on a mobile admin is effort not spent on the queue.
 *
 * Guards on `staffAuthStore` and nothing else: a partner session cannot open
 * this shell, because this shell never looks at one.
 */
export function StaffShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useStaffAuthStore((s) => s.session);
  const hydrated = useStaffAuthStore((s) => s.hydrated);
  const signOut = useStaffAuthStore((s) => s.signOut);

  useEffect(() => {
    if (!hydrated) return;
    // Carry the intended destination so sign-in lands where they were going,
    // rather than dumping everyone on their role's default screen.
    if (!session) router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, session, router, pathname]);

  if (!hydrated) {
    return (
      <div className="grid min-h-full place-items-center bg-cream">
        <div className="skeleton h-8 w-40 rounded-chip" />
      </div>
    );
  }

  if (!session) return null;

  const groups = staffNavItems(session);
  const needed = capabilityForPath(pathname);
  const allowed = !needed || staffCan(session, needed);

  return (
    <div className="admin-dense flex min-h-full bg-cream">
      <a href="#admin-main" className="skip-link">
        Skip to content
      </a>

      <nav
        aria-label="Admin sections"
        className="scroll-thin sticky top-0 hidden h-screen w-56 shrink-0 flex-col overflow-y-auto border-r border-line bg-paper lg:flex"
      >
        <div className="flex items-center gap-2 px-4 py-4">
          <Link href="/admin/overview" className="font-display text-base font-semibold tracking-tight">
            Ceylo
          </Link>
          <span className="rounded-chip bg-ink px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-cream">
            Admin
          </span>
        </div>

        <div className="flex-1 px-2 pb-4">
          {groups.map((group) => (
            <div key={group.label} className="mb-3">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                {group.label}
              </p>
              <ul>
                {group.items.map((item) => {
                  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[item.icon];
                  const active =
                    pathname === item.href || pathname.startsWith(item.href + "/");
                  // No endpoint behind it yet — the page says so, the nav hints it.
                  const soon = !LIVE_ROUTES.has(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors",
                          active
                            ? "bg-ink font-medium text-cream"
                            : "text-ink-soft hover:bg-cream-deep",
                        )}
                      >
                        {Icon && <Icon className="size-3.5 shrink-0" aria-hidden />}
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {soon && (
                          <span
                            title="No backend endpoint yet"
                            className={cn(
                              "rounded-chip px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide",
                              active ? "bg-cream text-ink" : "bg-sand text-ink-mute",
                            )}
                          >
                            Soon
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-12 items-center justify-between gap-4 border-b border-line bg-paper/95 px-4 backdrop-blur">
          <div className="flex items-center gap-2 lg:hidden">
            <Link href="/admin/overview" className="font-display text-sm font-semibold">
              Ceylo Admin
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Which backend you are about to change data in. */}
            <code
              title="Backend this console is talking to"
              className="rounded-chip bg-sand-soft px-2 py-0.5 font-mono text-[10px] text-ink-mute"
            >
              {API_ORIGIN_LABEL}
            </code>

            <div className="flex items-center gap-2">
              <span className="hidden text-right sm:block">
                <span className="block text-xs font-medium leading-tight text-ink">
                  {session.phone}
                </span>
                <span className="block text-[10px] leading-tight text-ink-mute">
                  {ROLE_SHORT[session.role]}
                </span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                signOut();
                router.replace("/admin/login");
              }}
              className="rounded-chip border border-line px-2.5 py-1 text-xs text-ink-soft hover:bg-cream-deep"
            >
              Sign out
            </button>
          </div>
        </header>

        <main id="admin-main" className="min-w-0 flex-1 p-4 lg:p-5">
          {allowed ? children : <Forbidden capability={needed!} role={ROLE_SHORT[session.role]} />}
        </main>
      </div>
    </div>
  );
}

/** 403. Role gating has to be visible, not just an empty nav. */
function Forbidden({ capability, role }: { capability: string; role: string }) {
  return (
    <div className="mx-auto mt-16 max-w-md rounded-tile border border-line bg-paper p-6 text-center shadow-tile">
      <Icons.ShieldX className="mx-auto size-8 text-coral" aria-hidden />
      <h1 className="mt-3 font-display text-lg font-semibold text-ink">Not your desk</h1>
      <p className="mt-1.5 text-sm text-ink-mute">
        This screen needs <code className="font-mono text-xs">{capability}</code>, which the {role}{" "}
        role does not hold.
      </p>
      <Link
        href="/admin/overview"
        className="mt-4 inline-flex h-9 items-center rounded-chip bg-ink px-4 text-xs font-medium text-cream"
      >
        Back to overview
      </Link>
    </div>
  );
}

/** Page header used by every admin screen, so they all start the same way. */
export function PageHead({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-0.5 text-xs text-ink-mute">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
