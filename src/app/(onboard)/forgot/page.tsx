"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, MailCheck } from "lucide-react";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useT } from "@/lib/i18n/useT";
import { isValidEmail } from "@/lib/srilanka";
import { sendOtp } from "@/lib/services/onboardingService";

export default function ForgotPasswordPage() {
  const { t } = useT();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-4 py-14">
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-lime-tint">
          <MailCheck className="size-5 text-ok" aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Check your email</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-mute">
          If an account exists for {email}, we have sent a link to reset the password. It expires in
          30 minutes.
        </p>
        <Link
          href="/onboarding"
          className="mt-6 inline-block text-sm text-ink underline underline-offset-2"
        >
          Back to Ceylo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <span className="inline-flex size-11 items-center justify-center rounded-full bg-cream-deep">
        <KeyRound className="size-5 text-ink" aria-hidden />
      </span>
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Reset your password</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-mute">
        Enter the work email you signed up with and we will send you a reset link.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <Input
          label={t("signup.email")}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          error={error}
        />
        <Button
          size="lg"
          full
          loading={busy}
          onClick={async () => {
            if (!isValidEmail(email)) return setError(t("valid.email"));
            setBusy(true);
            try {
              await sendOtp(email, "");
              setSent(true);
            } finally {
              setBusy(false);
            }
          }}
        >
          Send reset link
        </Button>
        <Link
          href="/onboarding"
          className="text-center text-xs text-ink-mute underline underline-offset-2 hover:text-ink"
        >
          {t("common.back")}
        </Link>
      </div>
    </div>
  );
}
