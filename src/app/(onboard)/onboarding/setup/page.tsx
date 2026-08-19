"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/lib/stores/onboardingStore";

/**
 * `setup` is a logical step but a per-vertical route. This lands anyone who
 * arrives at the generic href on the first vertical they actually chose.
 */
export default function SetupRedirectPage() {
  const router = useRouter();
  const verticals = useOnboardingStore((s) => s.draft.verticals);
  const hydrated = useOnboardingStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    router.replace(verticals.length ? `/onboarding/${verticals[0]}/setup` : "/onboarding/verticals");
  }, [hydrated, verticals, router]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <div className="skeleton h-10 w-2/3 rounded-tile" />
      <div className="skeleton mt-4 h-40 w-full rounded-tile" />
    </div>
  );
}
