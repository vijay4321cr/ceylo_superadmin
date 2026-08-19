/**
 * The wizard's spine. Steps, their completion predicates and the % they roll
 * up to. `completion` computed here is the SAME number the Ops queue column
 * shows — there is deliberately no second implementation.
 */

import type { DictKey } from "./i18n/config";
import type { Vertical } from "./types";
import type { OnboardingDraft } from "./stores/onboardingStore";
import { documentsFor, isValidNic, isValidPhone, isValidEmail, isValidBrn, isValidTin, isValidAccountNumber } from "./srilanka";

export type StepId =
  | "signup"
  | "verticals"
  | "business"
  | "documents"
  | "bank"
  | "setup"
  | "commercials"
  | "agreement"
  | "review";

export type Step = {
  id: StepId;
  labelKey: DictKey;
  href: string;
  /** Complete = the applicant may move past it and it stops blocking submit. */
  isComplete: (d: OnboardingDraft) => boolean;
  /** Human list of what is still missing, for the review screen. */
  missing: (d: OnboardingDraft) => string[];
};

export const STEPS: Step[] = [
  {
    id: "signup",
    labelKey: "step.signup",
    href: "/onboarding/signup",
    isComplete: (d) =>
      !!d.account.businessName &&
      !!d.account.contactName &&
      isValidEmail(d.account.email) &&
      isValidPhone(d.account.phone) &&
      d.account.emailVerified &&
      d.account.phoneVerified,
    missing: (d) => {
      const m: string[] = [];
      if (!d.account.businessName) m.push("Business name");
      if (!d.account.contactName) m.push("Contact name");
      if (!isValidEmail(d.account.email)) m.push("Work email");
      if (!isValidPhone(d.account.phone)) m.push("Mobile number");
      if (!d.account.emailVerified || !d.account.phoneVerified) m.push("Email / phone verification");
      return m;
    },
  },
  {
    id: "verticals",
    labelKey: "step.verticals",
    href: "/onboarding/verticals",
    isComplete: (d) => d.verticals.length > 0 && !!d.district,
    missing: (d) => {
      const m: string[] = [];
      if (!d.verticals.length) m.push("At least one vertical");
      if (!d.district) m.push("District");
      return m;
    },
  },
  {
    id: "business",
    labelKey: "step.business",
    href: "/onboarding/business",
    isComplete: (d) =>
      !!d.business.legalName &&
      isValidBrn(d.business.brn) &&
      isValidTin(d.business.tin) &&
      !!d.business.registeredAddress &&
      !!d.business.signatoryName &&
      isValidNic(d.business.signatoryNic),
    missing: (d) => {
      const m: string[] = [];
      if (!d.business.legalName) m.push("Registered legal name");
      if (!isValidBrn(d.business.brn)) m.push("Business registration number");
      if (!isValidTin(d.business.tin)) m.push("TIN");
      if (!d.business.registeredAddress) m.push("Registered address");
      if (!d.business.signatoryName) m.push("Signatory name");
      if (!isValidNic(d.business.signatoryNic)) m.push("Signatory NIC");
      return m;
    },
  },
  {
    id: "documents",
    labelKey: "step.documents",
    href: "/onboarding/documents",
    isComplete: (d) => requiredDocsMissing(d).length === 0,
    missing: (d) => requiredDocsMissing(d),
  },
  {
    id: "bank",
    labelKey: "step.bank",
    href: "/onboarding/bank",
    isComplete: (d) =>
      !!d.bank.accountName &&
      isValidAccountNumber(d.bank.accountNumber) &&
      !!d.bank.bankName &&
      !!d.bank.branchName &&
      d.bank.pennyDropStatus === "verified",
    missing: (d) => {
      const m: string[] = [];
      if (!d.bank.accountName) m.push("Account holder name");
      if (!isValidAccountNumber(d.bank.accountNumber)) m.push("Account number");
      if (!d.bank.bankName) m.push("Bank");
      if (!d.bank.branchName) m.push("Branch");
      if (d.bank.pennyDropStatus !== "verified") m.push("Account verification (penny drop)");
      return m;
    },
  },
  {
    id: "setup",
    labelKey: "step.setup",
    href: "/onboarding/setup",
    isComplete: (d) => d.verticals.every((v) => setupComplete(d, v)),
    missing: (d) => {
      const m: string[] = [];
      for (const v of d.verticals) {
        if (!setupComplete(d, v)) {
          m.push(v === "dining" ? "Restaurant setup" : v === "ferry" ? "Ferry setup" : "Events setup");
        }
      }
      return m;
    },
  },
  {
    id: "commercials",
    labelKey: "step.commercials",
    href: "/onboarding/commercials",
    isComplete: (d) => d.commercialsAcknowledged,
    missing: (d) => (d.commercialsAcknowledged ? [] : ["Acknowledge the commercial terms"]),
  },
  {
    id: "agreement",
    labelKey: "step.agreement",
    href: "/onboarding/agreement",
    isComplete: (d) => !!d.agreement.signedAt,
    missing: (d) => (d.agreement.signedAt ? [] : ["Merchant agreement signature"]),
  },
  {
    id: "review",
    labelKey: "step.review",
    href: "/onboarding/review",
    isComplete: (d) => d.status !== "draft" && d.status !== "changes_requested",
    missing: () => [],
  },
];

/** The steps that count toward the % — `review` is the act of finishing, not a step. */
const SCORED = STEPS.filter((s) => s.id !== "review");

export function completionOf(draft: OnboardingDraft): number {
  const done = SCORED.filter((s) => s.isComplete(draft)).length;
  return Math.round((done / SCORED.length) * 100);
}

export function firstIncompleteStep(draft: OnboardingDraft): Step {
  return SCORED.find((s) => !s.isComplete(draft)) ?? STEPS[STEPS.length - 1];
}

export function stepById(id: string): Step | undefined {
  return STEPS.find((s) => s.id === id);
}

export function stepIndex(id: string): number {
  const i = STEPS.findIndex((s) => s.id === id);
  return i === -1 ? 0 : i;
}

/** Everything still blocking submit, grouped by step. */
export function blockers(draft: OnboardingDraft): { step: Step; items: string[] }[] {
  return SCORED.map((step) => ({ step, items: step.missing(draft) })).filter(
    (b) => b.items.length > 0,
  );
}

/* ------------------------------------------------------- linear wizard */

export type WizardRoute = {
  id: string;
  stepId: StepId;
  href: string;
  labelKey: DictKey;
  vertical?: Vertical;
};

/**
 * The actual linear order the applicant walks, with the `setup` step expanded
 * into one route per vertical they chose. Back/Continue and the rail are both
 * driven from this, so they can never disagree about what comes next.
 */
export function wizardRoutes(draft: OnboardingDraft): WizardRoute[] {
  const out: WizardRoute[] = [];
  for (const step of STEPS) {
    if (step.id !== "setup") {
      out.push({ id: step.id, stepId: step.id, href: step.href, labelKey: step.labelKey });
      continue;
    }
    for (const v of draft.verticals) {
      out.push({
        id: `setup:${v}`,
        stepId: "setup",
        href: `/onboarding/${v}/setup`,
        labelKey: step.labelKey,
        vertical: v,
      });
    }
  }
  return out;
}

export function routeNeighbours(
  draft: OnboardingDraft,
  currentId: string,
): { prev?: WizardRoute; next?: WizardRoute; index: number; total: number } {
  const routes = wizardRoutes(draft);
  const i = routes.findIndex((r) => r.id === currentId);
  return {
    prev: i > 0 ? routes[i - 1] : undefined,
    next: i >= 0 && i < routes.length - 1 ? routes[i + 1] : undefined,
    index: i,
    total: routes.length,
  };
}

/* ---------------------------------------------------------------- helpers */

function requiredDocsMissing(d: OnboardingDraft): string[] {
  const specs = documentsFor(d.verticals, d.flags);
  return specs
    .filter((spec) => {
      if (!spec.required) return false;
      const doc = d.documents[spec.type];
      // A rejected document is as blocking as one that was never uploaded.
      if (!doc || doc.status === "rejected") return true;
      if (spec.dateBound && !doc.expiresAt) return true;
      return false;
    })
    .map((spec) => spec.label);
}

function setupComplete(d: OnboardingDraft, v: string): boolean {
  if (v === "dining") {
    const s = d.setup.dining;
    return !!s && !!s.about && s.cuisines.length > 0 && s.priceForTwoCents > 0 && s.openDays.length > 0;
  }
  if (v === "ferry") {
    const s = d.setup.ferry;
    return (
      !!s &&
      !!s.operatorName &&
      s.vessels.length > 0 &&
      s.routes.length > 0 &&
      s.fares.length > 0 &&
      s.departures.length > 0
    );
  }
  if (v === "event") {
    const s = d.setup.event;
    return (
      !!s &&
      !!s.organiserName &&
      !!s.firstEvent.title &&
      !!s.firstEvent.venue &&
      !!s.firstEvent.startsAt &&
      s.tiers.length > 0
    );
  }
  return true;
}
