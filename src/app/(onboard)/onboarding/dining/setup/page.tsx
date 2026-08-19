"use client";

import { useState } from "react";
import { StepShell } from "@/components/onboarding/StepShell";
import { RepeatList } from "@/components/onboarding/RepeatList";
import {
  ChipSelect,
  Input,
  MoneyInput,
  RadioGroup,
  Textarea,
  WeekdayPicker,
} from "@/components/ui/Field";
import { useT } from "@/lib/i18n/useT";
import { useOnboardingStore } from "@/lib/stores/onboardingStore";
import { CUISINES, DINING_OCCASIONS } from "@/lib/srilanka";
import type { DiningSetup } from "@/lib/types";

const BLANK: DiningSetup = {
  about: "",
  cuisines: [],
  priceForTwoCents: 0,
  openTime: "11:00",
  closeTime: "23:00",
  openDays: [1, 2, 3, 4, 5, 6, 7],
  tableTypes: [{ name: "Indoor", seats: 4, count: 8 }],
  slotMinutes: 90,
  confirmationMode: "instant",
  occasions: [],
  cancellationPolicy: "Free cancellation up to 2 hours before the booking.",
};

export default function DiningSetupPage() {
  const { t } = useT();
  const draft = useOnboardingStore((s) => s.draft);
  const patchSetup = useOnboardingStore((s) => s.patchSetup);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const s = draft.setup.dining ?? BLANK;
  const readOnly = draft.status === "submitted" || draft.status === "under_review";
  const set = (patch: Partial<DiningSetup>) => patchSetup({ dining: { ...s, ...patch } });

  return (
    <StepShell
      routeId="setup:dining"
      title={t("setup.diningTitle")}
      subtitle="Everything here carries straight into your dashboard once you go live — you will not be asked again."
      continueDisabled={readOnly}
      onContinue={() => {
        const e: Record<string, string> = {};
        if (!s.about.trim()) e.about = t("valid.required");
        if (!s.cuisines.length) e.cuisines = t("valid.required");
        if (s.priceForTwoCents <= 0) e.price = t("valid.positive");
        if (!s.openDays.length) e.openDays = t("valid.required");
        if (!s.tableTypes.length) e.tables = t("valid.required");
        setErrors(e);
        return Object.keys(e).length === 0;
      }}
    >
      <Textarea
        label={t("setup.about")}
        required
        disabled={readOnly}
        rows={3}
        placeholder="Two or three sentences a customer would want to read."
        value={s.about}
        onChange={(e) => set({ about: e.target.value })}
        error={errors.about}
      />

      <ChipSelect
        label={t("setup.cuisines")}
        options={CUISINES}
        selected={s.cuisines}
        error={errors.cuisines}
        onToggle={(v) =>
          set({
            cuisines: s.cuisines.includes(v)
              ? s.cuisines.filter((x) => x !== v)
              : [...s.cuisines, v],
          })
        }
      />

      <MoneyInput
        label={t("setup.priceForTwo")}
        required
        hint="Roughly what two people spend, including taxes."
        valueCents={s.priceForTwoCents}
        onChangeCents={(cents) => set({ priceForTwoCents: cents })}
        error={errors.price}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Opens"
          type="time"
          disabled={readOnly}
          value={s.openTime}
          onChange={(e) => set({ openTime: e.target.value })}
        />
        <Input
          label="Closes"
          type="time"
          disabled={readOnly}
          value={s.closeTime}
          onChange={(e) => set({ closeTime: e.target.value })}
        />
      </div>

      <WeekdayPicker
        label={t("setup.openDays")}
        value={s.openDays}
        onChange={(openDays) => set({ openDays })}
        error={errors.openDays}
      />

      <RepeatList
        label={t("setup.tables")}
        hint="How many of each, and how many people they seat."
        items={s.tableTypes}
        min={1}
        readOnly={readOnly}
        error={errors.tables}
        blank={() => ({ name: "", seats: 2, count: 1 })}
        addLabel="Add a table type"
        onChange={(tableTypes) => set({ tableTypes })}
        renderRow={(row, update) => (
          <>
            <Input
              dense
              label="Name"
              placeholder="Indoor / Terrace / Bar"
              disabled={readOnly}
              value={row.name}
              onChange={(e) => update({ name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                dense
                label="Seats"
                type="number"
                min={1}
                disabled={readOnly}
                value={row.seats}
                onChange={(e) => update({ seats: Number(e.target.value) })}
              />
              <Input
                dense
                label="How many"
                type="number"
                min={1}
                disabled={readOnly}
                value={row.count}
                onChange={(e) => update({ count: Number(e.target.value) })}
              />
            </div>
          </>
        )}
      />

      <RadioGroup
        label={t("setup.slotLength")}
        value={String(s.slotMinutes)}
        columns={2}
        onChange={(v) => set({ slotMinutes: Number(v) })}
        options={[
          { value: "60", label: "60 minutes" },
          { value: "90", label: "90 minutes" },
          { value: "120", label: "2 hours" },
          { value: "150", label: "2.5 hours" },
        ]}
      />

      <RadioGroup
        label={t("setup.confirmation")}
        value={s.confirmationMode}
        onChange={(v) => set({ confirmationMode: v })}
        options={[
          {
            value: "instant",
            label: t("setup.instant"),
            description: "Customers get a confirmed table straight away.",
          },
          {
            value: "request",
            label: t("setup.request"),
            description: "You have 30 minutes to accept or decline each request.",
          },
        ]}
      />

      <ChipSelect
        label={t("setup.occasions")}
        options={DINING_OCCASIONS}
        selected={s.occasions}
        onToggle={(v) =>
          set({
            occasions: s.occasions.includes(v)
              ? s.occasions.filter((x) => x !== v)
              : [...s.occasions, v],
          })
        }
      />

      <Textarea
        label={t("setup.cancellation")}
        disabled={readOnly}
        rows={2}
        value={s.cancellationPolicy}
        onChange={(e) => set({ cancellationPolicy: e.target.value })}
      />
    </StepShell>
  );
}
