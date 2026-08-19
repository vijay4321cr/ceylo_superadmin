"use client";

import { useState } from "react";
import { BadgeCheck, Landmark } from "lucide-react";
import { StepShell } from "@/components/onboarding/StepShell";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useT } from "@/lib/i18n/useT";
import { useOnboardingStore } from "@/lib/stores/onboardingStore";
import { BANKS, isValidAccountNumber } from "@/lib/srilanka";
import { confirmPennyDrop, startPennyDrop } from "@/lib/services/onboardingService";
import { toast } from "@/components/ui/Toast";

export default function BankPage() {
  const { t } = useT();
  const draft = useOnboardingStore((s) => s.draft);
  const patchBank = useOnboardingStore((s) => s.patchBank);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [entered, setEntered] = useState("");

  const bank = draft.bank;
  const readOnly = draft.status === "submitted" || draft.status === "under_review";
  const verified = bank.pennyDropStatus === "verified";
  const branches = BANKS.find((b) => b.name === bank.bankName)?.branches ?? [];

  function validateDetails() {
    const e: Record<string, string> = {};
    if (!bank.accountName.trim()) e.accountName = t("valid.required");
    if (!isValidAccountNumber(bank.accountNumber)) e.accountNumber = t("valid.account");
    if (!bank.bankName) e.bankName = t("valid.required");
    if (!bank.branchName) e.branchName = t("valid.required");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleStart() {
    if (!validateDetails()) return;
    setSending(true);
    try {
      const { reference } = await startPennyDrop();
      patchBank({ pennyDropReference: reference, pennyDropStatus: "pending" });
    } finally {
      setSending(false);
    }
  }

  async function handleConfirm() {
    setChecking(true);
    try {
      const { verified: ok } = await confirmPennyDrop(bank.pennyDropReference ?? "", entered);
      if (ok) {
        patchBank({ pennyDropStatus: "verified" });
        toast(t("bank.verified"));
      } else {
        patchBank({ pennyDropStatus: "failed" });
      }
    } finally {
      setChecking(false);
    }
  }

  return (
    <StepShell
      routeId="bank"
      title={t("bank.title")}
      subtitle={t("bank.subtitle")}
      onContinue={() => {
        if (!validateDetails()) return false;
        if (!verified) {
          setErrors({ ...errors, pennyDrop: t("bank.verify") });
          return false;
        }
        return true;
      }}
      continueDisabled={readOnly}
    >
      <Input
        label={t("bank.accountName")}
        required
        disabled={readOnly || verified}
        value={bank.accountName}
        onChange={(e) => patchBank({ accountName: e.target.value })}
        error={errors.accountName}
      />
      <Input
        label={t("bank.accountNumber")}
        required
        inputMode="numeric"
        disabled={readOnly || verified}
        value={bank.accountNumber}
        onChange={(e) => patchBank({ accountNumber: e.target.value.replace(/\D/g, "") })}
        error={errors.accountNumber}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label={t("bank.bank")}
          required
          disabled={readOnly || verified}
          placeholder={t("common.select")}
          value={bank.bankName}
          error={errors.bankName}
          options={BANKS.map((b) => ({ value: b.name, label: b.name }))}
          onChange={(e) => {
            const picked = BANKS.find((b) => b.name === e.target.value);
            patchBank({
              bankName: e.target.value,
              bankCode: picked?.code ?? "",
              branchName: "",
              branchCode: "",
            });
          }}
        />
        <Select
          label={t("bank.branch")}
          required
          disabled={readOnly || verified || !bank.bankName}
          placeholder={t("common.select")}
          value={bank.branchName}
          error={errors.branchName}
          options={branches.map((b) => ({ value: b.name, label: `${b.name} (${b.code})` }))}
          onChange={(e) => {
            const picked = branches.find((b) => b.name === e.target.value);
            patchBank({ branchName: e.target.value, branchCode: picked?.code ?? "" });
          }}
        />
      </div>

      {bank.bankCode && (
        <p className="text-xs text-ink-mute">
          Bank code {bank.bankCode}
          {bank.branchCode && ` · Branch code ${bank.branchCode}`} — used for the LankaPay/CEFTS
          transfer.
        </p>
      )}

      {/* Penny drop */}
      <section className="rounded-tile border border-line bg-sand-soft/50 p-4">
        {verified ? (
          <p className="flex items-center gap-2 text-sm font-medium text-ok">
            <BadgeCheck className="size-5" aria-hidden />
            {t("bank.verified")}
          </p>
        ) : bank.pennyDropReference ? (
          <>
            <p className="flex items-center gap-2 text-sm font-medium text-ink">
              <Landmark className="size-4 text-ink-mute" aria-hidden />
              {t("bank.pennyTitle")}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-mute">{t("bank.pennyBody")}</p>
            <p className="mt-2 rounded-md bg-sky-tint/60 px-2.5 py-1.5 text-xs text-ink">
              {t("bank.pennyDevHint", { ref: bank.pennyDropReference })}
            </p>

            <div className="mt-3 flex items-end gap-2">
              <Input
                className="flex-1"
                label={t("bank.reference")}
                dense
                maxLength={6}
                disabled={readOnly}
                value={entered}
                onChange={(e) => setEntered(e.target.value.toUpperCase())}
                error={bank.pennyDropStatus === "failed" ? t("bank.failed") : undefined}
              />
              <Button
                onClick={handleConfirm}
                loading={checking}
                disabled={entered.length < 6 || readOnly}
              >
                {t("common.confirm")}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-ink">{t("bank.verify")}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-mute">{t("bank.pennyBody")}</p>
            <Button
              className="mt-3"
              variant="secondary"
              onClick={handleStart}
              loading={sending}
              disabled={readOnly}
              icon={sending ? undefined : <Landmark className="size-4" />}
            >
              {t("bank.verify")}
            </Button>
          </>
        )}
      </section>

      {errors.pennyDrop && !verified && (
        <p role="alert" className="text-xs text-danger">
          {errors.pennyDrop}
        </p>
      )}
    </StepShell>
  );
}
