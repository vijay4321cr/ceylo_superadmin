"use client";

import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { useState } from "react";
import { LanguageSwitcher } from "@/lib/i18n/LanguageSwitcher";
import { useT } from "@/lib/i18n/useT";
import { Modal } from "@/components/ui/Modal";

/** Language is reachable from every step — not just the gate. */
export function OnboardHeader() {
  const { t } = useT();
  const [help, setHelp] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <Link href="/onboarding" className="font-display text-lg font-semibold tracking-tight">
          Ceylo
          <span className="ml-1.5 align-middle text-[10px] font-medium uppercase tracking-widest text-ink-mute">
            Partners
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setHelp(true)}
            className="rounded-chip p-1.5 text-ink-mute hover:bg-cream-deep hover:text-ink"
            aria-label={t("common.help")}
          >
            <HelpCircle className="size-5" />
          </button>
        </div>
      </div>

      <Modal open={help} onClose={() => setHelp(false)} title={t("common.help")}>
        <p className="text-sm text-ink-soft">{t("common.helpBody")}</p>
        <p className="mt-3 text-sm text-ink-soft">{t("submitted.contact")}</p>
      </Modal>
    </header>
  );
}
