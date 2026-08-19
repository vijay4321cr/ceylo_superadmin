"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { UserPlus } from "lucide-react";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { useT } from "@/lib/i18n/useT";
import { isValidPhone } from "@/lib/srilanka";

/**
 * A colleague joining a partner that already exists on Ceylo. They do not
 * re-do onboarding — the business is already approved; they just need an
 * account against it.
 */
export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-14"><div className="skeleton h-40 rounded-tile" /></div>}>
      <AcceptInvite />
    </Suspense>
  );
}

function AcceptInvite() {
  const { t } = useT();
  const router = useRouter();
  const params = useSearchParams();
  const business = params.get("business") ?? "your team";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <span className="inline-flex size-11 items-center justify-center rounded-full bg-lime-tint">
        <UserPlus className="size-5 text-ink" aria-hidden />
      </span>
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
        Join {business} on Ceylo
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-mute">
        You have been invited to help manage this business. Your colleague has already completed the
        application, so this only takes a minute.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <Input
          label={t("signup.contactName")}
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <Input
          label={t("signup.phone")}
          type="tel"
          required
          autoComplete="tel"
          hint={t("signup.phoneHint")}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
        />
        <Button
          size="lg"
          full
          loading={busy}
          onClick={() => {
            const e: Record<string, string> = {};
            if (!name.trim()) e.name = t("valid.required");
            if (!isValidPhone(phone)) e.phone = t("valid.phone");
            setErrors(e);
            if (Object.keys(e).length) return;
            setBusy(true);
            toast("Invitation accepted");
            router.push("/onboarding");
          }}
        >
          Accept invitation
        </Button>
      </div>
    </div>
  );
}
