"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { StepShell } from "@/components/onboarding/StepShell";
import { RepeatList } from "@/components/onboarding/RepeatList";
import { Input, MoneyInput, RadioGroup, Select, Textarea } from "@/components/ui/Field";
import { useT } from "@/lib/i18n/useT";
import { useOnboardingStore } from "@/lib/stores/onboardingStore";
import { DISTRICT_NAMES, EVENT_CATEGORIES } from "@/lib/srilanka";
import type { EventSetup } from "@/lib/types";

const BLANK: EventSetup = {
  organiserName: "",
  about: "",
  firstEvent: {
    title: "",
    category: "Music",
    venue: "",
    district: "",
    startsAt: "",
    seating: "ga",
  },
  tiers: [{ name: "General", priceCents: 0, quantity: 100 }],
  saleStart: "",
  saleEnd: "",
  perUserCap: 6,
  refundPolicy: "Full refund if the event is cancelled or postponed by more than 14 days.",
};

export default function EventSetupPage() {
  const { t } = useT();
  const draft = useOnboardingStore((s) => s.draft);
  const patchSetup = useOnboardingStore((s) => s.patchSetup);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const s = draft.setup.event ?? BLANK;
  const readOnly = draft.status === "submitted" || draft.status === "under_review";
  const set = (patch: Partial<EventSetup>) => patchSetup({ event: { ...s, ...patch } });
  const setEvent = (patch: Partial<EventSetup["firstEvent"]>) =>
    set({ firstEvent: { ...s.firstEvent, ...patch } });

  return (
    <StepShell
      routeId="setup:event"
      title={t("setup.eventTitle")}
      subtitle="Your organiser profile is approved once. Each event you list is checked separately."
      continueDisabled={readOnly}
      onContinue={() => {
        const e: Record<string, string> = {};
        if (!s.organiserName.trim()) e.organiserName = t("valid.required");
        if (!s.firstEvent.title.trim()) e.title = t("valid.required");
        if (!s.firstEvent.venue.trim()) e.venue = t("valid.required");
        if (!s.firstEvent.district) e.district = t("valid.required");
        if (!s.firstEvent.startsAt) e.startsAt = t("valid.required");
        if (!s.tiers.length || s.tiers.some((x) => !x.name.trim() || x.quantity <= 0))
          e.tiers = "Every tier needs a name and a quantity.";
        setErrors(e);
        return Object.keys(e).length === 0;
      }}
      notice={
        <div className="flex items-start gap-2.5 rounded-tile border border-violet/40 bg-violet-tint/40 p-3.5">
          <Info className="mt-0.5 size-4 shrink-0 text-violet" aria-hidden />
          <p className="text-sm leading-relaxed text-ink-soft">{t("setup.eventModeration")}</p>
        </div>
      }
    >
      <Input
        label="Organiser name"
        required
        disabled={readOnly}
        value={s.organiserName}
        onChange={(e) => set({ organiserName: e.target.value })}
        error={errors.organiserName}
      />
      <Textarea
        label={t("setup.about")}
        disabled={readOnly}
        rows={3}
        value={s.about}
        onChange={(e) => set({ about: e.target.value })}
      />

      <section className="border-t border-line-soft pt-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">{t("setup.firstEvent")}</h2>
        <div className="flex flex-col gap-4">
          <Input
            label="Event title"
            required
            disabled={readOnly}
            value={s.firstEvent.title}
            onChange={(e) => setEvent({ title: e.target.value })}
            error={errors.title}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Category"
              disabled={readOnly}
              value={s.firstEvent.category}
              options={EVENT_CATEGORIES.map((c) => ({ value: c, label: c }))}
              onChange={(e) => setEvent({ category: e.target.value })}
            />
            <Select
              label={t("verticals.district")}
              required
              disabled={readOnly}
              placeholder={t("common.select")}
              value={s.firstEvent.district}
              options={DISTRICT_NAMES.map((d) => ({ value: d, label: d }))}
              error={errors.district}
              onChange={(e) => setEvent({ district: e.target.value })}
            />
          </div>
          <Input
            label="Venue"
            required
            disabled={readOnly}
            value={s.firstEvent.venue}
            onChange={(e) => setEvent({ venue: e.target.value })}
            error={errors.venue}
          />
          <Input
            label="Starts at"
            type="datetime-local"
            required
            disabled={readOnly}
            value={s.firstEvent.startsAt}
            onChange={(e) => setEvent({ startsAt: e.target.value })}
            error={errors.startsAt}
            hint="Colombo time."
          />
          <RadioGroup
            label="Seating"
            value={s.firstEvent.seating}
            columns={2}
            onChange={(seating) => setEvent({ seating })}
            options={[
              { value: "ga", label: "General admission", description: "No allocated seats." },
              { value: "seated", label: "Seated", description: "Customers pick a seat." },
            ]}
          />
        </div>
      </section>

      <RepeatList
        label={t("setup.tiers")}
        hint="Price and how many of each. Free tiers are allowed — set the price to zero."
        items={s.tiers}
        min={1}
        readOnly={readOnly}
        error={errors.tiers}
        addLabel="Add a tier"
        blank={() => ({ name: "", priceCents: 0, quantity: 50 })}
        onChange={(tiers) => set({ tiers })}
        renderRow={(tier, update) => (
          <>
            <Input
              dense
              label="Tier name"
              placeholder="Early bird / VIP"
              disabled={readOnly}
              value={tier.name}
              onChange={(e) => update({ name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <MoneyInput
                dense
                label="Price"
                valueCents={tier.priceCents}
                onChangeCents={(priceCents) => update({ priceCents })}
              />
              <Input
                dense
                label="Quantity"
                type="number"
                min={1}
                disabled={readOnly}
                value={tier.quantity}
                onChange={(e) => update({ quantity: Number(e.target.value) })}
              />
            </div>
          </>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Sales open"
          type="datetime-local"
          disabled={readOnly}
          value={s.saleStart}
          onChange={(e) => set({ saleStart: e.target.value })}
        />
        <Input
          label="Sales close"
          type="datetime-local"
          disabled={readOnly}
          value={s.saleEnd}
          onChange={(e) => set({ saleEnd: e.target.value })}
        />
      </div>

      <Input
        label={t("setup.perUserCap")}
        type="number"
        min={1}
        max={20}
        disabled={readOnly}
        hint="Keeping this low is your best defence against scalpers."
        value={s.perUserCap}
        onChange={(e) => set({ perUserCap: Number(e.target.value) })}
      />

      <Textarea
        label={t("setup.refundPolicy")}
        disabled={readOnly}
        rows={2}
        value={s.refundPolicy}
        onChange={(e) => set({ refundPolicy: e.target.value })}
      />
    </StepShell>
  );
}
