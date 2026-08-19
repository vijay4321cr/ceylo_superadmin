"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { StepShell } from "@/components/onboarding/StepShell";
import { RepeatList } from "@/components/onboarding/RepeatList";
import {
  Checkbox,
  Input,
  MoneyInput,
  Select,
  Textarea,
  Toggle,
  WeekdayPicker,
} from "@/components/ui/Field";
import { useT } from "@/lib/i18n/useT";
import { useOnboardingStore } from "@/lib/stores/onboardingStore";
import { INTERNATIONAL_PORTS, PORTS } from "@/lib/srilanka";
import type { FerrySetup } from "@/lib/types";

const BLANK: FerrySetup = {
  operatorName: "",
  about: "",
  vessels: [{ name: "", regNo: "", classes: [{ name: "Economy", capacity: 120 }] }],
  routes: [{ from: "Colombo", to: "Kankesanthurai", durationMins: 300, international: false }],
  fares: [{ className: "Economy", fareCents: 0 }],
  scheduleDays: [1, 3, 5],
  departures: ["07:00"],
  perUserCap: 6,
  passportRequiredInternational: true,
  cancellationTiers: [
    { hoursBefore: 48, refundPct: 100 },
    { hoursBefore: 24, refundPct: 50 },
    { hoursBefore: 6, refundPct: 0 },
  ],
};

const ALL_PORTS = [...PORTS, ...INTERNATIONAL_PORTS];

export default function FerrySetupPage() {
  const { t } = useT();
  const draft = useOnboardingStore((s) => s.draft);
  const patchSetup = useOnboardingStore((s) => s.patchSetup);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const s = draft.setup.ferry ?? BLANK;
  const readOnly = draft.status === "submitted" || draft.status === "under_review";
  const set = (patch: Partial<FerrySetup>) => patchSetup({ ferry: { ...s, ...patch } });

  const hasInternational = s.routes.some((r) => r.international);

  return (
    <StepShell
      routeId="setup:ferry"
      title={t("setup.ferryTitle")}
      subtitle="Vessels, routes, fares and the sailing timetable. This becomes your live schedule."
      continueDisabled={readOnly}
      onContinue={() => {
        const e: Record<string, string> = {};
        if (!s.operatorName.trim()) e.operatorName = t("valid.required");
        if (!s.vessels.length || s.vessels.some((v) => !v.name.trim() || !v.regNo.trim()))
          e.vessels = "Every vessel needs a name and a registration number.";
        if (!s.routes.length) e.routes = t("valid.required");
        if (!s.fares.length || s.fares.some((f) => f.fareCents <= 0))
          e.fares = "Every class needs a fare above zero.";
        if (!s.departures.length) e.departures = t("valid.required");
        setErrors(e);
        return Object.keys(e).length === 0;
      }}
    >
      <Input
        label="Operator name"
        required
        disabled={readOnly}
        value={s.operatorName}
        onChange={(e) => set({ operatorName: e.target.value })}
        error={errors.operatorName}
      />
      <Textarea
        label={t("setup.about")}
        disabled={readOnly}
        rows={3}
        value={s.about}
        onChange={(e) => set({ about: e.target.value })}
      />

      <RepeatList
        label={t("setup.vessels")}
        hint="One row per vessel. Deck classes and capacity set your seat map."
        items={s.vessels}
        min={1}
        readOnly={readOnly}
        error={errors.vessels}
        addLabel="Add a vessel"
        blank={() => ({ name: "", regNo: "", classes: [{ name: "Economy", capacity: 100 }] })}
        onChange={(vessels) => set({ vessels })}
        renderRow={(vessel, update) => (
          <>
            <Input
              dense
              label="Vessel name"
              disabled={readOnly}
              value={vessel.name}
              onChange={(e) => update({ name: e.target.value })}
            />
            <Input
              dense
              label="Registration no."
              disabled={readOnly}
              value={vessel.regNo}
              onChange={(e) => update({ regNo: e.target.value })}
            />
            <div className="sm:col-span-2">
              <p className="mb-1.5 text-xs font-medium text-ink-mute">Deck classes</p>
              <div className="flex flex-col gap-1.5">
                {vessel.classes.map((c, ci) => (
                  <div key={ci} className="flex items-center gap-1.5">
                    <input
                      className="h-9 min-w-0 flex-1 rounded-tile border border-line bg-paper px-2.5 text-sm"
                      placeholder="Class name"
                      disabled={readOnly}
                      value={c.name}
                      onChange={(e) => {
                        const classes = [...vessel.classes];
                        classes[ci] = { ...c, name: e.target.value };
                        update({ classes });
                      }}
                      aria-label="Class name"
                    />
                    <input
                      type="number"
                      min={1}
                      className="h-9 w-24 rounded-tile border border-line bg-paper px-2.5 text-sm tabular-nums"
                      disabled={readOnly}
                      value={c.capacity}
                      onChange={(e) => {
                        const classes = [...vessel.classes];
                        classes[ci] = { ...c, capacity: Number(e.target.value) };
                        update({ classes });
                      }}
                      aria-label="Capacity"
                    />
                    {vessel.classes.length > 1 && !readOnly && (
                      <button
                        type="button"
                        aria-label={t("common.remove")}
                        onClick={() =>
                          update({ classes: vessel.classes.filter((_, x) => x !== ci) })
                        }
                        className="rounded-chip p-1.5 text-ink-mute hover:text-danger"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() =>
                      update({ classes: [...vessel.classes, { name: "", capacity: 50 }] })
                    }
                    className="inline-flex items-center gap-1 self-start text-xs text-ink-mute hover:text-ink"
                  >
                    <Plus className="size-3" aria-hidden />
                    Add class
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      />

      <RepeatList
        label={t("setup.routes")}
        hint="Mark a route international if it leaves Sri Lankan waters — that triggers the passport rule."
        items={s.routes}
        min={1}
        readOnly={readOnly}
        error={errors.routes}
        addLabel="Add a route"
        blank={() => ({ from: "Colombo", to: "Galle", durationMins: 120, international: false })}
        onChange={(routes) => set({ routes })}
        renderRow={(route, update) => (
          <>
            <Select
              dense
              label="From"
              disabled={readOnly}
              value={route.from}
              options={ALL_PORTS.map((p) => ({ value: p, label: p }))}
              onChange={(e) => update({ from: e.target.value })}
            />
            <Select
              dense
              label="To"
              disabled={readOnly}
              value={route.to}
              options={ALL_PORTS.map((p) => ({ value: p, label: p }))}
              onChange={(e) => {
                const to = e.target.value;
                update({ to, international: INTERNATIONAL_PORTS.includes(to) });
              }}
            />
            <Input
              dense
              label="Duration (minutes)"
              type="number"
              min={10}
              disabled={readOnly}
              value={route.durationMins}
              onChange={(e) => update({ durationMins: Number(e.target.value) })}
            />
            <div className="flex items-end pb-1">
              <Checkbox
                label="International sailing"
                checked={route.international}
                disabled={readOnly}
                onChange={(international) => update({ international })}
              />
            </div>
          </>
        )}
      />

      <RepeatList
        label={t("setup.fares")}
        items={s.fares}
        min={1}
        readOnly={readOnly}
        error={errors.fares}
        addLabel="Add a fare"
        blank={() => ({ className: "", fareCents: 0 })}
        onChange={(fares) => set({ fares })}
        renderRow={(fare, update) => (
          <>
            <Input
              dense
              label="Class"
              disabled={readOnly}
              value={fare.className}
              onChange={(e) => update({ className: e.target.value })}
            />
            <MoneyInput
              dense
              label="Fare per passenger"
              valueCents={fare.fareCents}
              onChangeCents={(fareCents) => update({ fareCents })}
            />
          </>
        )}
      />

      <WeekdayPicker
        label={t("setup.schedule")}
        value={s.scheduleDays}
        onChange={(scheduleDays) => set({ scheduleDays })}
      />

      <DepartureEditor
        value={s.departures}
        onChange={(departures) => set({ departures })}
        readOnly={readOnly}
        error={errors.departures}
      />

      <Input
        label={t("setup.perUserCap")}
        type="number"
        min={1}
        max={50}
        disabled={readOnly}
        value={s.perUserCap}
        onChange={(e) => set({ perUserCap: Number(e.target.value) })}
      />

      {hasInternational && (
        <div className="anim-rise rounded-tile border border-sky/40 bg-sky-tint/40 p-3.5">
          <Toggle
            label={t("setup.passportRule")}
            description="Required by law on international sailings — passengers cannot book without one."
            checked={s.passportRequiredInternational}
            onChange={(v) => set({ passportRequiredInternational: v })}
          />
        </div>
      )}

      <RepeatList
        label="Cancellation tiers"
        hint="How much a passenger gets back, by how far ahead they cancel."
        items={s.cancellationTiers}
        readOnly={readOnly}
        addLabel="Add a tier"
        blank={() => ({ hoursBefore: 12, refundPct: 25 })}
        onChange={(cancellationTiers) => set({ cancellationTiers })}
        renderRow={(tier, update) => (
          <>
            <Input
              dense
              label="Hours before departure"
              type="number"
              min={0}
              disabled={readOnly}
              value={tier.hoursBefore}
              onChange={(e) => update({ hoursBefore: Number(e.target.value) })}
            />
            <Input
              dense
              label="Refund %"
              type="number"
              min={0}
              max={100}
              disabled={readOnly}
              value={tier.refundPct}
              onChange={(e) => update({ refundPct: Number(e.target.value) })}
            />
          </>
        )}
      />
    </StepShell>
  );
}

function DepartureEditor({
  value,
  onChange,
  readOnly,
  error,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  readOnly?: boolean;
  error?: string;
}) {
  const { t } = useT();
  return (
    <section className="flex flex-col gap-2">
      <p className="text-sm font-medium text-ink-soft">{t("setup.departures")}</p>
      <div className="flex flex-wrap gap-2">
        {value.map((time, i) => (
          <div key={i} className="flex items-center gap-1 rounded-chip border border-line bg-paper pl-2 pr-1">
            <input
              type="time"
              disabled={readOnly}
              value={time}
              aria-label={`Departure ${i + 1}`}
              onChange={(e) => {
                const next = [...value];
                next[i] = e.target.value;
                onChange(next);
              }}
              className="h-9 border-0 bg-transparent text-sm focus:outline-none"
            />
            {!readOnly && value.length > 1 && (
              <button
                type="button"
                aria-label={t("common.remove")}
                onClick={() => onChange(value.filter((_, x) => x !== i))}
                className="rounded-chip p-1 text-ink-mute hover:text-danger"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        ))}
        {!readOnly && (
          <button
            type="button"
            onClick={() => onChange([...value, "12:00"])}
            className="inline-flex h-11 items-center gap-1 rounded-chip border border-dashed border-line px-3 text-xs font-medium text-ink-soft hover:border-ink hover:text-ink"
          >
            <Plus className="size-3.5" aria-hidden />
            {t("common.add")}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </section>
  );
}
