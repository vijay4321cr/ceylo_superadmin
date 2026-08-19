import type { ReactNode } from "react";
import { OnboardHeader } from "@/components/onboarding/OnboardHeader";

/**
 * The applicant surface. Deliberately does NOT use the partner dashboard's
 * AppShell — there is no partner session here yet and no vertical switcher.
 * Mobile-first: an applicant fills this in on a phone, mid-service.
 */
export default function OnboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-cream">
      <a href="#onboard-main" className="skip-link">
        Skip to content
      </a>
      <OnboardHeader />
      <main id="onboard-main" className="flex-1 pb-24">
        {children}
      </main>
    </div>
  );
}
