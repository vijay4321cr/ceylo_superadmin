"use client";

import { useState } from "react";
import { StepShell } from "@/components/onboarding/StepShell";
import { Input, Select, Textarea, Checkbox } from "@/components/ui/Field";
import { useT } from "@/lib/i18n/useT";
import { useOnboardingStore } from "@/lib/stores/onboardingStore";
import {
  DISTRICT_NAMES,
  isValidBrn,
  isValidNic,
  isValidTin,
  isValidVat,
  provinceForDistrict,
} from "@/lib/srilanka";
import { ReviewNotesBanner } from "@/components/onboarding/ReviewNotesBanner";

export default function BusinessPage() {
  const { t } = useT();
  const draft = useOnboardingStore((s) => s.draft);
  const patch = useOnboardingStore((s) => s.patch);
  const patchBusiness = useOnboardingStore((s) => s.patchBusiness);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const b = draft.business;
  const readOnly = draft.status === "submitted" || draft.status === "under_review";

  function validate() {
    const e: Record<string, string> = {};
    if (!b.legalName.trim()) e.legalName = t("valid.required");
    if (!isValidBrn(b.brn)) e.brn = t("valid.brn");
    if (!isValidTin(b.tin)) e.tin = t("valid.tin");
    if (draft.flags.vatRegistered && !isValidVat(b.vatNumber ?? "")) e.vatNumber = t("valid.vat");
    if (!b.registeredAddress.trim()) e.registeredAddress = t("valid.required");
    if (!b.district) e.district = t("valid.required");
    if (!b.signatoryName.trim()) e.signatoryName = t("valid.required");
    if (!isValidNic(b.signatoryNic)) e.signatoryNic = t("valid.nic");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  return (
    <StepShell
      routeId="business"
      title={t("business.title")}
      subtitle={t("business.subtitle")}
      onContinue={validate}
      continueDisabled={readOnly}
      notice={<ReviewNotesBanner prefix="business" />}
    >
      <Input
        label={t("business.legalName")}
        required
        disabled={readOnly}
        value={b.legalName}
        onChange={(e) => patchBusiness({ legalName: e.target.value })}
        error={errors.legalName}
      />
      <Input
        label={t("business.tradingName")}
        hint={t("business.tradingHint")}
        optional={t("common.optional")}
        disabled={readOnly}
        value={b.tradingName}
        onChange={(e) => patchBusiness({ tradingName: e.target.value })}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t("business.brn")}
          hint={t("business.brnHint")}
          required
          disabled={readOnly}
          placeholder="PV 123456"
          value={b.brn}
          onChange={(e) => patchBusiness({ brn: e.target.value })}
          error={errors.brn}
        />
        <Input
          label={t("business.tin")}
          hint={t("business.tinHint")}
          required
          disabled={readOnly}
          inputMode="numeric"
          placeholder="123456789"
          value={b.tin}
          onChange={(e) => patchBusiness({ tin: e.target.value })}
          error={errors.tin}
        />
      </div>

      <div className="flex flex-col gap-3">
        <Checkbox
          label={t("business.vatRegistered")}
          checked={draft.flags.vatRegistered}
          onChange={(v) => patch({ flags: { ...draft.flags, vatRegistered: v } })}
          disabled={readOnly}
        />
        {draft.flags.vatRegistered && (
          <Input
            className="anim-rise"
            label={t("business.vat")}
            hint={t("business.vatHint")}
            disabled={readOnly}
            value={b.vatNumber ?? ""}
            onChange={(e) => patchBusiness({ vatNumber: e.target.value })}
            error={errors.vatNumber}
          />
        )}
      </div>

      <Textarea
        label={t("business.address")}
        required
        disabled={readOnly}
        rows={3}
        value={b.registeredAddress}
        onChange={(e) => patchBusiness({ registeredAddress: e.target.value })}
        error={errors.registeredAddress}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label={t("verticals.district")}
          required
          disabled={readOnly}
          placeholder={t("common.select")}
          value={b.district}
          options={DISTRICT_NAMES.map((d) => ({ value: d, label: d }))}
          error={errors.district}
          onChange={(e) =>
            patchBusiness({
              district: e.target.value,
              province: provinceForDistrict(e.target.value),
            })
          }
        />
        <Input label={t("verticals.province")} disabled value={b.province} readOnly />
      </div>

      {/* Dining-only conditional flags — they decide which §8 docs get asked. */}
      {draft.verticals.includes("dining") && (
        <div className="flex flex-col gap-2 border-t border-line-soft pt-5">
          <Checkbox
            label={t("business.servesAlcohol")}
            checked={draft.flags.servesAlcohol}
            onChange={(v) => patch({ flags: { ...draft.flags, servesAlcohol: v } })}
            disabled={readOnly}
          />
          <Checkbox
            label={t("business.servesTourists")}
            checked={draft.flags.servesTourists}
            onChange={(v) => patch({ flags: { ...draft.flags, servesTourists: v } })}
            disabled={readOnly}
          />
        </div>
      )}

      <div className="border-t border-line-soft pt-5">
        <p className="mb-1 text-sm font-medium text-ink-soft">{t("business.signatory")}</p>
        <p className="mb-3 text-xs text-ink-mute">{t("business.signatoryHint")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t("business.signatoryName")}
            required
            disabled={readOnly}
            autoComplete="name"
            value={b.signatoryName}
            onChange={(e) => patchBusiness({ signatoryName: e.target.value })}
            error={errors.signatoryName}
          />
          <Input
            label={t("business.nic")}
            hint={t("business.nicHint")}
            required
            disabled={readOnly}
            placeholder="200012345678"
            value={b.signatoryNic}
            onChange={(e) => patchBusiness({ signatoryNic: e.target.value.toUpperCase() })}
            error={errors.signatoryNic}
          />
        </div>
      </div>
    </StepShell>
  );
}
