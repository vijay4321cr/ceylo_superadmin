"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, LogIn, ShieldCheck, ShieldPlus } from "lucide-react";
import { useStaffAuthStore, roleFromClaim } from "@/lib/stores/staffAuthStore";
import { DEV_OTP, bootstrapAdmin, decodeToken, sendOtp, verifyOtp } from "@/lib/services/ceyloApi";
import { API_ORIGIN_LABEL, errorText } from "@/lib/api/client";
import { landingFor } from "@/lib/staffRbac";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";

export default function StaffLoginPage() {
  return (
    <Suspense fallback={<div className="grid min-h-full place-items-center bg-cream" />}>
      <StaffLogin />
    </Suspense>
  );
}

/**
 * Sign-in against the real Ceylo backend. One token: it authenticates the API
 * calls and it opens the console. There is no demo mode and no local persona.
 */
function StaffLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  /** Only ever an in-console path — never an arbitrary redirect target. */
  const returnTo = next && next.startsWith("/admin/") ? next : null;

  const setSession = useStaffAuthStore((s) => s.setSession);

  const [stage, setStage] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);

  async function handleSend() {
    if (!phone.trim()) {
      setError("Enter the phone number registered as an admin.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { sessionId: id } = await sendOtp(phone.trim());
      if (!id) throw new Error("The backend did not return a session id.");
      setSessionId(id);
      setStage("otp");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify() {
    if (!otp.trim()) {
      setError("Enter the code you were sent.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { accessToken, refreshToken } = await verifyOtp(sessionId, phone.trim(), otp.trim());
      const claims = decodeToken(accessToken);
      const role = roleFromClaim(claims.role);

      if (!role) {
        setError(
          `This account signed in, but its role is "${claims.role ?? "unknown"}" — the console needs an admin. ` +
            `Use "Make an account admin" below, then sign in again.`,
        );
        return;
      }

      setSession({
        staffId: claims.sub ?? phone.trim(),
        phone: claims.phone ?? phone.trim(),
        role,
        backendRole: claims.role ?? "",
        accessToken,
        refreshToken,
        signedInAt: new Date().toISOString(),
      });
      router.replace(returnTo ?? landingFor(role));
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-full place-items-center bg-cream px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-5 flex items-center gap-2">
          <p className="font-display text-xl font-semibold tracking-tight">Ceylo</p>
          <span className="rounded-chip bg-ink px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-cream">
            Admin
          </span>
          <code className="ml-auto rounded-chip bg-sand-soft px-2 py-0.5 font-mono text-[10px] text-ink-mute">
            {API_ORIGIN_LABEL}
          </code>
        </div>

        <div className="rounded-tile border border-line bg-paper p-5 shadow-tile">
          <h1 className="font-display text-lg font-semibold text-ink">Staff sign in</h1>
          <p className="mt-1 text-xs leading-relaxed text-ink-mute">
            {stage === "phone"
              ? "Sign in with the phone number that holds an admin role on the Ceylo backend."
              : `Enter the 6-digit code sent to ${phone}.`}
          </p>

          <div className="mt-4 flex flex-col gap-4">
            {stage === "phone" ? (
              <Input
                label="Phone number"
                type="tel"
                required
                autoComplete="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError("");
                }}
                error={error}
              />
            ) : (
              <>
                {DEV_OTP && (
                  <div className="rounded-tile border border-sky/30 bg-sky-tint/40 px-3 py-2 text-[11px] text-ink-soft">
                    <KeyRound className="mr-1.5 inline size-3 align-text-bottom" aria-hidden />
                    This build is configured with a development code:{" "}
                    <code className="font-mono font-semibold">{DEV_OTP}</code>.
                  </div>
                )}
                <Input
                  label="Verification code"
                  required
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ""));
                    setError("");
                  }}
                  error={error}
                />
                <button
                  type="button"
                  onClick={() => {
                    setStage("phone");
                    setError("");
                  }}
                  className="self-start text-[11px] text-ink-mute underline underline-offset-2 hover:text-ink"
                >
                  Use a different number
                </button>
              </>
            )}

            <Button
              full
              size="lg"
              variant="ink"
              loading={busy}
              onClick={stage === "phone" ? handleSend : handleVerify}
              icon={<LogIn className="size-4" />}
            >
              {stage === "phone" ? "Send code" : "Verify and sign in"}
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setBootstrapping(true)}
            className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-ink-mute underline underline-offset-2 hover:text-ink"
          >
            <ShieldPlus className="size-3" aria-hidden />
            Make an account admin
          </button>
        </div>

        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ink-mute">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          The role is baked into the token when it is issued, so after promoting an account you have
          to sign in again before the console will let you in.
        </p>
      </div>

      <BootstrapModal open={bootstrapping} onClose={() => setBootstrapping(false)} />
    </div>
  );
}

function BootstrapModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [phone, setPhone] = useState("");
  const [secret, setSecret] = useState("");
  const [role, setRole] = useState("super_admin");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Make an account admin"
      description="A fresh backend has nobody who can approve anything. This promotes a phone number to an admin role."
      footer={
        <>
          <Button size="sm" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            loading={busy}
            onClick={async () => {
              if (!phone.trim() || !secret.trim()) {
                setError("Both the phone and the bootstrap secret are required.");
                return;
              }
              setBusy(true);
              setError("");
              try {
                await bootstrapAdmin(phone.trim(), secret.trim(), role);
                toast(`${phone.trim()} is now ${role} — sign in again to pick up the role`);
                onClose();
              } catch (e) {
                setError(errorText(e));
              } finally {
                setBusy(false);
              }
            }}
          >
            Promote
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Phone to promote"
          required
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setError("");
          }}
        />
        <Input
          label="Bootstrap secret"
          required
          type="password"
          hint="Configured on the backend."
          value={secret}
          onChange={(e) => {
            setSecret(e.target.value);
            setError("");
          }}
          error={error}
        />
        <Select
          label="Role"
          value={role}
          options={[
            { value: "super_admin", label: "Super admin" },
            { value: "admin", label: "Admin" },
          ]}
          onChange={(e) => setRole(e.target.value)}
        />
      </div>
    </Modal>
  );
}

