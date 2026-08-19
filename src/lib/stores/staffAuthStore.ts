"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StaffRole } from "../types";

/**
 * The console session — a real JWT from the Ceylo backend.
 *
 * There is one sign-in, not two: the token that proves who you are to the API
 * is the same token that opens the console. Nothing here is a demo persona.
 */
export type StaffSession = {
  /** `sub` from the JWT. */
  staffId: string;
  phone: string;
  /** Mapped from the backend's role claim — see `roleFromClaim`. */
  role: StaffRole;
  /** The raw claim, shown in the UI so there is no ambiguity about access. */
  backendRole: string;
  accessToken: string;
  refreshToken: string | null;
  signedInAt: string;
};

/**
 * The backend distinguishes `customer` from `admin` / `super_admin` and
 * nothing finer. Anything that is not an admin gets no console at all.
 */
export function roleFromClaim(claim: string | undefined): StaffRole | null {
  if (claim === "super_admin") return "super_admin";
  if (claim === "admin") return "super_admin";
  return null;
}

type StaffAuthState = {
  session: StaffSession | null;
  hydrated: boolean;
  setSession: (session: StaffSession) => void;
  /** Used by the refresh flow, which only replaces the tokens. */
  setTokens: (accessToken: string, refreshToken: string | null) => void;
  signOut: () => void;
};

export const useStaffAuthStore = create<StaffAuthState>()(
  persist(
    (set) => ({
      session: null,
      hydrated: false,
      setSession: (session) => set({ session }),
      setTokens: (accessToken, refreshToken) =>
        set((s) => (s.session ? { session: { ...s.session, accessToken, refreshToken } } : s)),
      signOut: () => set({ session: null }),
    }),
    {
      name: "ceylo-staff-session",
      partialize: (s) => ({ session: s.session }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
