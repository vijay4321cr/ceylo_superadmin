"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "../types";
import { DEFAULT_LOCALE } from "../i18n/config";

type LocaleState = {
  locale: Locale;
  /** False until the applicant has actively chosen at the language gate. */
  chosen: boolean;
  setLocale: (locale: Locale) => void;
  hydrated: boolean;
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      chosen: false,
      hydrated: false,
      setLocale: (locale) => set({ locale, chosen: true }),
    }),
    {
      name: "ceylo-locale",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
