"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ApplicationStatus,
  BusinessIdentity,
  DocumentType,
  Province,
  ReviewNote,
  Vertical,
  VerticalSetup,
} from "../types";

export type DraftDocument = {
  fileName: string;
  /** Data URL in mock; becomes a signed CDN URL against the real API. */
  fileUrl: string;
  status: "pending" | "verified" | "rejected";
  rejectReason?: string;
  expiresAt?: string;
  uploadedAt: string;
};

export type OnboardingDraft = {
  /** Stable across the whole application, so Ops can find a resumed draft. */
  partnerId: string;
  /** Set on submit — one application row per vertical. */
  applicationIds: Partial<Record<Vertical, string>>;
  reference?: string;

  account: {
    businessName: string;
    contactName: string;
    email: string;
    phone: string;
    emailVerified: boolean;
    phoneVerified: boolean;
  };

  verticals: Vertical[];
  district: string;
  province: Province | "";
  scale: Partial<Record<Vertical, string>>;

  business: BusinessIdentity;
  flags: { vatRegistered: boolean; servesAlcohol: boolean; servesTourists: boolean };

  documents: Partial<Record<DocumentType, DraftDocument>>;

  bank: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    bankCode: string;
    branchName: string;
    branchCode: string;
    pennyDropStatus: "pending" | "verified" | "failed";
    pennyDropReference?: string;
  };

  setup: VerticalSetup;

  /** Rates are set by Ceylo — the applicant acknowledges, never edits. */
  commercials: {
    commissionPct: number;
    convenienceFeeCents: number;
    settlementCycle: "weekly" | "fortnightly" | "monthly";
    whtPct: number;
  };
  commercialsAcknowledged: boolean;

  agreement: { version: string; signatory: string; signedAt?: string };

  status: ApplicationStatus;
  lastStep: string;
  submittedAt?: string;
  reviewNotes: ReviewNote[];
  /** Wall-clock of the last autosave, for the "Saved just now" indicator. */
  savedAt?: string;
};

export const AGREEMENT_VERSION = "2026.1";

export function emptyDraft(): OnboardingDraft {
  return {
    partnerId: `ptr_${Math.random().toString(36).slice(2, 8)}`,
    applicationIds: {},
    account: {
      businessName: "",
      contactName: "",
      email: "",
      phone: "",
      emailVerified: false,
      phoneVerified: false,
    },
    verticals: [],
    district: "",
    province: "",
    scale: {},
    business: {
      legalName: "",
      tradingName: "",
      brn: "",
      tin: "",
      vatNumber: "",
      registeredAddress: "",
      district: "",
      province: "",
      signatoryName: "",
      signatoryNic: "",
      contactEmail: "",
      contactPhone: "",
    },
    flags: { vatRegistered: false, servesAlcohol: false, servesTourists: false },
    documents: {},
    bank: {
      accountName: "",
      accountNumber: "",
      bankName: "",
      bankCode: "",
      branchName: "",
      branchCode: "",
      pennyDropStatus: "pending",
    },
    setup: {},
    // Default rates until Ops sets partner-specific ones.
    commercials: {
      commissionPct: 12,
      convenienceFeeCents: 15000,
      settlementCycle: "weekly",
      whtPct: 5,
    },
    commercialsAcknowledged: false,
    agreement: { version: AGREEMENT_VERSION, signatory: "" },
    status: "draft",
    lastStep: "signup",
    reviewNotes: [],
  };
}

type OnboardingState = {
  draft: OnboardingDraft;
  hydrated: boolean;
  /** True while an autosave is in flight — drives the StepShell indicator. */
  saving: boolean;

  /** Shallow-merge patch. Every field change in the wizard calls this. */
  patch: (patch: Partial<OnboardingDraft>) => void;
  patchAccount: (patch: Partial<OnboardingDraft["account"]>) => void;
  patchBusiness: (patch: Partial<BusinessIdentity>) => void;
  patchBank: (patch: Partial<OnboardingDraft["bank"]>) => void;
  patchSetup: (patch: Partial<VerticalSetup>) => void;
  setDocument: (type: DocumentType, doc: DraftDocument | undefined) => void;
  setLastStep: (step: string) => void;
  setSaving: (saving: boolean) => void;
  reset: () => void;
  /** True once the applicant has actually started (used for resume vs begin). */
  hasDraft: () => boolean;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      draft: emptyDraft(),
      hydrated: false,
      saving: false,

      patch: (patch) =>
        set((s) => ({
          draft: { ...s.draft, ...patch, savedAt: new Date().toISOString() },
        })),

      patchAccount: (patch) =>
        set((s) => ({
          draft: {
            ...s.draft,
            account: { ...s.draft.account, ...patch },
            savedAt: new Date().toISOString(),
          },
        })),

      patchBusiness: (patch) =>
        set((s) => ({
          draft: {
            ...s.draft,
            business: { ...s.draft.business, ...patch },
            savedAt: new Date().toISOString(),
          },
        })),

      patchBank: (patch) =>
        set((s) => ({
          draft: {
            ...s.draft,
            bank: { ...s.draft.bank, ...patch },
            savedAt: new Date().toISOString(),
          },
        })),

      patchSetup: (patch) =>
        set((s) => ({
          draft: {
            ...s.draft,
            setup: { ...s.draft.setup, ...patch },
            savedAt: new Date().toISOString(),
          },
        })),

      setDocument: (type, doc) =>
        set((s) => {
          const documents = { ...s.draft.documents };
          if (doc) documents[type] = doc;
          else delete documents[type];
          return { draft: { ...s.draft, documents, savedAt: new Date().toISOString() } };
        }),

      setLastStep: (step) => set((s) => ({ draft: { ...s.draft, lastStep: step } })),

      setSaving: (saving) => set({ saving }),

      reset: () => set({ draft: emptyDraft() }),

      hasDraft: () => {
        const d = get().draft;
        return !!d.account.businessName || d.verticals.length > 0;
      },
    }),
    {
      // Deliberately its own key — the partner session and the staff session
      // never share storage. See §5.1.
      name: "ceylo-onboarding-draft",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
