"use client";

import { useState } from "react";
import { Utensils, Ship, PartyPopper, Check } from "lucide-react";
import { StepShell } from "@/components/onboarding/StepShell";
import { Input, Select } from "@/components/ui/Field";
import { useT } from "@/lib/i18n/useT";
import { useOnboardingStore } from "@/lib/stores/onboardingStore";
import { DISTRICT_NAMES, provinceForDistrict } from "@/lib/srilanka";
import { cn } from "@/lib/cn";
import type { Vertical } from "@/lib/types";
import type { DictKey } from "@/lib/i18n/config";

const CARDS: {
  vertical: Vertical;
  labelKey: DictKey;
  descKey: DictKey;
  scaleKey: DictKey;
  scalePh: string;
  icon: React.ReactNode;
  ring: string;
  tint: string;
  text: string;
}[] = [
  {
    vertical: "dining",
    labelKey: "verticals.dining",
    descKey: "verticals.diningDesc",
    scaleKey: "verticals.scaleDining",
    scalePh: "1 restaurant",
    icon: <Utensils className="size-5" />,
    ring: "border-coral",
    tint: "bg-coral-tint/50",
    text: "text-coral",
  },
  {
    vertical: "ferry",
    labelKey: "verticals.ferry",
    descKey: "verticals.ferryDesc",
    scaleKey: "verticals.scaleFerry",
    scalePh: "3 vessels",
    icon: <Ship className="size-5" />,
    ring: "border-sky",
    tint: "bg-sky-tint/50",
    text: "text-sky",
  },
  {
    vertical: "event",
    labelKey: "verticals.event",
    descKey: "verticals.eventDesc",
    scaleKey: "verticals.scaleEvent",
    scalePh: "~5 events a month",
    icon: <PartyPopper className="size-5" />,
    ring: "border-violet",
    tint: "bg-violet-tint/50",
    text: "text-violet",
  },
];

export default function VerticalsPage() {
  const { t } = useT();
  const draft = useOnboardingStore((s) => s.draft);
  const patch = useOnboardingStore((s) => s.patch);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function toggle(v: Vertical) {
    const next = draft.verticals.includes(v)
      ? draft.verticals.filter((x) => x !== v)
      : [...draft.verticals, v];
    patch({ verticals: next });
  }

  return (
    <StepShell
      routeId="verticals"
      title={t("verticals.title")}
      subtitle={t("verticals.subtitle")}
      onContinue={() => {
        const e: Record<string, string> = {};
        if (!draft.verticals.length) e.verticals = t("verticals.errorPick");
        if (!draft.district) e.district = t("valid.required");
        setErrors(e);
        return Object.keys(e).length === 0;
      }}
    >
      <div className="flex flex-col gap-2.5">
        {CARDS.map((card) => {
          const active = draft.verticals.includes(card.vertical);
          return (
            <div key={card.vertical}>
              <button
                type="button"
                onClick={() => toggle(card.vertical)}
                aria-pressed={active}
                className={cn(
                  "flex w-full items-start gap-3 rounded-tile border p-4 text-left transition",
                  active
                    ? `${card.ring} ${card.tint}`
                    : "border-line bg-paper hover:bg-cream-deep/60",
                )}
              >
                <span className={cn("mt-0.5", active ? card.text : "text-ink-faint")}>
                  {card.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-medium text-ink">{t(card.labelKey)}</span>
                  <span className="mt-0.5 block text-sm text-ink-mute">{t(card.descKey)}</span>
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border",
                    active ? "border-ink bg-ink text-cream" : "border-line",
                  )}
                >
                  {active && <Check className="size-3.5" strokeWidth={3} />}
                </span>
              </button>

              {/* Scale routes the lead to the right Ops queue, so ask it here. */}
              {active && (
                <div className="anim-rise mt-2 pl-4">
                  <Input
                    dense
                    label={t(card.scaleKey)}
                    placeholder={card.scalePh}
                    value={draft.scale[card.vertical] ?? ""}
                    onChange={(e) =>
                      patch({ scale: { ...draft.scale, [card.vertical]: e.target.value } })
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {errors.verticals && (
        <p role="alert" className="text-xs text-danger">
          {errors.verticals}
        </p>
      )}

      <div className="mt-2 border-t border-line-soft pt-5">
        <p className="mb-3 text-sm font-medium text-ink-soft">{t("verticals.where")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label={t("verticals.district")}
            required
            placeholder={t("common.select")}
            value={draft.district}
            error={errors.district}
            options={DISTRICT_NAMES.map((d) => ({ value: d, label: d }))}
            onChange={(e) => {
              const district = e.target.value;
              patch({
                district,
                province: provinceForDistrict(district),
                business: { ...draft.business, district, province: provinceForDistrict(district) },
              });
            }}
          />
          <Select
            label={t("verticals.province")}
            // Province is implied by district — shown, not asked.
            disabled
            value={draft.province}
            options={draft.province ? [{ value: draft.province, label: draft.province }] : []}
            placeholder="—"
            onChange={() => {}}
          />
        </div>
      </div>
    </StepShell>
  );
}
