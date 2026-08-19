"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, ShieldCheck } from "lucide-react";
import { StepShell } from "@/components/onboarding/StepShell";
import { Input } from "@/components/ui/Field";
import { useT } from "@/lib/i18n/useT";
import { useOnboardingStore } from "@/lib/stores/onboardingStore";
import { isValidEmail, isValidPhone, formatPhone, normalisePhone } from "@/lib/srilanka";
import { sendOtp, verifyOtp } from "@/lib/services/onboardingService";
import { toast } from "@/components/ui/Toast";

export default function SignupPage() {
  const { t } = useT();
  const router = useRouter();
  const draft = useOnboardingStore((s) => s.draft);
  const patchAccount = useOnboardingStore((s) => s.patchAccount);
  const patchBusiness = useOnboardingStore((s) => s.patchBusiness);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stage, setStage] = useState<"details" | "otp">(
    draft.account.emailVerified && draft.account.phoneVerified ? "details" : "details",
  );
  const [devCode, setDevCode] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [sending, setSending] = useState(false);

  const a = draft.account;
  const verified = a.emailVerified && a.phoneVerified;

  function validateDetails() {
    const e: Record<string, string> = {};
    if (!a.businessName.trim()) e.businessName = t("valid.required");
    if (!a.contactName.trim()) e.contactName = t("valid.required");
    if (!isValidEmail(a.email)) e.email = t("valid.email");
    if (!isValidPhone(a.phone)) e.phone = t("valid.phone");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSendOtp() {
    if (!validateDetails()) return;
    setSending(true);
    try {
      const { code } = await sendOtp(a.email, a.phone);
      setDevCode(code);
      setStage("otp");
      // Carry the contact details into the business identity so the applicant
      // never types the same thing twice.
      patchBusiness({ contactEmail: a.email, contactPhone: normalisePhone(a.phone) });
    } finally {
      setSending(false);
    }
  }

  async function handleVerify() {
    if (!/^\d{6}$/.test(emailCode) || !/^\d{6}$/.test(phoneCode)) {
      setErrors({
        emailCode: /^\d{6}$/.test(emailCode) ? "" : t("valid.otp"),
        phoneCode: /^\d{6}$/.test(phoneCode) ? "" : t("valid.otp"),
      });
      return;
    }
    const ok = await verifyOtp(emailCode, phoneCode);
    if (ok) {
      patchAccount({ emailVerified: true, phoneVerified: true });
      toast(t("docs.verified"));
      router.push("/onboarding/verticals");
    } else {
      setErrors({ emailCode: t("valid.otp") });
    }
  }

  if (stage === "otp" && !verified) {
    return (
      <StepShell
        routeId="signup"
        title={t("signup.otpTitle")}
        subtitle={t("signup.otpSubtitle", {
          email: a.email,
          phone: formatPhone(a.phone),
        })}
        onContinue={async () => {
          await handleVerify();
          return false; // handleVerify navigates itself once the codes pass.
        }}
        continueLabel={t("signup.verify")}
      >
        <div className="rounded-tile border border-sky/30 bg-sky-tint/40 p-3 text-xs text-ink-soft">
          <ShieldCheck className="mr-1.5 inline size-3.5 align-text-bottom" aria-hidden />
          {t("signup.devHint", { code: devCode })}
        </div>

        <Input
          label={t("signup.emailCode")}
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
          value={emailCode}
          onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ""))}
          error={errors.emailCode}
          className="tabular-nums"
        />
        <Input
          label={t("signup.phoneCode")}
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
          value={phoneCode}
          onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, ""))}
          error={errors.phoneCode}
        />

        <button
          type="button"
          onClick={handleSendOtp}
          className="self-start text-xs text-ink-mute underline underline-offset-2 hover:text-ink"
        >
          {t("signup.resend")}
        </button>
      </StepShell>
    );
  }

  return (
    <StepShell
      routeId="signup"
      title={t("signup.title")}
      subtitle={t("signup.subtitle")}
      continueLabel={verified ? t("common.continue") : t("signup.submit")}
      continueLoading={sending}
      onContinue={async () => {
        if (verified) return validateDetails();
        await handleSendOtp();
        return false; // stay on the step and show the OTP stage
      }}
    >
      <Input
        label={t("signup.businessName")}
        placeholder={t("signup.businessNamePh")}
        required
        autoComplete="organization"
        value={a.businessName}
        onChange={(e) => patchAccount({ businessName: e.target.value })}
        error={errors.businessName}
      />
      <Input
        label={t("signup.contactName")}
        placeholder={t("signup.contactNamePh")}
        required
        autoComplete="name"
        value={a.contactName}
        onChange={(e) => patchAccount({ contactName: e.target.value })}
        error={errors.contactName}
      />
      <Input
        label={t("signup.email")}
        type="email"
        inputMode="email"
        required
        autoComplete="email"
        value={a.email}
        onChange={(e) => patchAccount({ email: e.target.value, emailVerified: false })}
        error={errors.email}
      />
      <Input
        label={t("signup.phone")}
        type="tel"
        inputMode="tel"
        required
        autoComplete="tel"
        placeholder="+94 77 123 4567"
        hint={t("signup.phoneHint")}
        value={a.phone}
        onChange={(e) => patchAccount({ phone: e.target.value, phoneVerified: false })}
        error={errors.phone}
      />

      {verified && (
        <p className="flex items-center gap-2 text-xs text-ok">
          <Mail className="size-3.5" aria-hidden />
          <Phone className="size-3.5" aria-hidden />
          {t("docs.verified")}
        </p>
      )}
    </StepShell>
  );
}
