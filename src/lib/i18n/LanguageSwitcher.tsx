"use client";

import { Globe } from "lucide-react";
import { useLocaleStore } from "../stores/localeStore";
import { LOCALES } from "./config";

/** Compact switcher for the onboarding header — available at every step. */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <Globe className="size-4 text-ink-mute" aria-hidden />
      <div
        role="group"
        aria-label="Language"
        className="flex rounded-chip border border-line bg-paper p-0.5"
      >
        {LOCALES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLocale(l.code)}
            aria-pressed={locale === l.code}
            lang={l.code}
            className={`rounded-chip px-2.5 py-1 text-xs font-medium transition-colors ${
              locale === l.code
                ? "bg-ink text-cream"
                : "text-ink-mute hover:bg-cream-deep hover:text-ink"
            }`}
          >
            {l.native}
          </button>
        ))}
      </div>
    </div>
  );
}
