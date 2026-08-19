"use client";

/**
 * The applicant wizard's own service.
 *
 * The wizard captures a draft entirely in the browser — that is the applicant's
 * own input, not sample data, and it survives a closed tab by design. What does
 * NOT exist yet is anywhere to send it: the Ceylo backend has no partner
 * application endpoints, so `submitApplication` reports that rather than
 * pretending to file something.
 *
 * To connect it, the API needs the partner-side registration flow:
 *   POST /partner/register
 *   POST /partner/restaurant
 *   POST /partner/kyc/submit
 */

import type { OnboardingDraft } from "../stores/onboardingStore";
import { completionOf, firstIncompleteStep } from "../onboardingSteps";

/** Raised by `submitApplication` while there is no endpoint to submit to. */
export class NotConnectedError extends Error {
  endpoints = ["POST /partner/register", "POST /partner/restaurant", "POST /partner/kyc/submit"];
  constructor() {
    super(
      "Submitting an application is not connected to the Ceylo backend yet, so nothing was sent. " +
        "Your answers are saved in this browser and will still be here when the API is ready.",
    );
    this.name = "NotConnectedError";
  }
}

function delay<T>(value: T, ms: number): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/* -------------------------------------------------------------- OTP / auth */

/**
 * Local-only verification so the wizard can be walked end to end. The screen
 * that uses it says so on the page — no code is actually sent anywhere.
 */
export async function sendOtp(_email: string, _phone: string): Promise<{ code: string }> {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  return delay({ code }, 400);
}

export async function verifyOtp(emailCode: string, phoneCode: string): Promise<boolean> {
  return delay(/^\d{6}$/.test(emailCode) && /^\d{6}$/.test(phoneCode), 400);
}

/* -------------------------------------------------------------- penny drop */

export async function startPennyDrop(): Promise<{ reference: string }> {
  return delay({ reference: Math.random().toString(36).slice(2, 8).toUpperCase() }, 800);
}

export async function confirmPennyDrop(
  expected: string,
  entered: string,
): Promise<{ verified: boolean }> {
  return delay({ verified: entered.trim().toUpperCase() === expected.toUpperCase() }, 600);
}

/* ------------------------------------------------------------------ draft */

/** The completion figure the checklist rail shows. */
export function completion(draft: OnboardingDraft): number {
  return completionOf(draft);
}

/** The draft lives in `onboardingStore`, which persists it to this browser. */
export async function saveDraft(_draft: OnboardingDraft): Promise<{ savedAt: string }> {
  return delay({ savedAt: new Date().toISOString() }, 120);
}

/** Where a returning applicant should land. */
export function resumeHref(draft: OnboardingDraft): string {
  if (draft.status !== "draft" && draft.status !== "changes_requested") {
    return "/onboarding/submitted";
  }
  return firstIncompleteStep(draft).href;
}

/* ----------------------------------------------------------------- submit */

/**
 * There is no partner application endpoint on the backend, so this always
 * reports that rather than quietly storing the application somewhere fake.
 */
export async function submitApplication(_draft: OnboardingDraft): Promise<never> {
  await delay(null, 300);
  throw new NotConnectedError();
}
