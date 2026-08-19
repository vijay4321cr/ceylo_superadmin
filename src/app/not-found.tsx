import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="grid flex-1 place-items-center bg-cream px-4 py-16">
      <div className="w-full max-w-sm rounded-tile border border-line bg-paper p-6 text-center shadow-tile">
        <Compass className="mx-auto size-8 text-ink-faint" aria-hidden />
        <h1 className="mt-3 font-display text-lg font-semibold text-ink">Page not found</h1>
        <p className="mt-1.5 text-sm text-ink-mute">
          That address does not exist on Ceylo.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Link
            href="/onboarding"
            className="inline-flex h-10 items-center justify-center rounded-chip bg-lime px-4 text-sm font-semibold text-ink hover:bg-lime-deep"
          >
            Partner onboarding
          </Link>
          <Link
            href="/admin/login"
            className="inline-flex h-10 items-center justify-center rounded-chip border border-line px-4 text-sm text-ink-soft hover:bg-cream-deep"
          >
            Staff sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
