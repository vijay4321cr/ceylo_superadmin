"use client";

import { useCallback } from "react";
import { useLocaleStore } from "../stores/localeStore";
import { translate, type DictKey } from "./config";
import type { Locale } from "../types";

export type TFn = (key: DictKey, vars?: Record<string, string | number>) => string;

/**
 * The only translation hook. Every applicant-facing string goes through it.
 * The admin console is English-only by design and does not use this.
 */
export function useT(): { t: TFn; locale: Locale } {
  const locale = useLocaleStore((s) => s.locale);
  const t = useCallback<TFn>((key, vars) => translate(locale, key, vars), [locale]);
  return { t, locale };
}
