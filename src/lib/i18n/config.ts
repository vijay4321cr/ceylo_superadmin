import type { Locale } from "../types";
import { en } from "./dictionaries/en";
import { si } from "./dictionaries/si";
import { ta } from "./dictionaries/ta";
import type { DictKey, Dictionary } from "./dictionaries/en";

export type { DictKey, Dictionary };

export const LOCALES: {
  code: Locale;
  /** Endonym — always shown in its own script, never translated. */
  native: string;
  english: string;
}[] = [
  { code: "si", native: "සිංහල", english: "Sinhala" },
  { code: "ta", native: "தமிழ்", english: "Tamil" },
  { code: "en", native: "English", english: "English" },
];

export const DEFAULT_LOCALE: Locale = "en";

export const DICTIONARIES: Record<Locale, Dictionary> = {
  en: en as unknown as Dictionary,
  si,
  ta,
};

/** Interpolates `{name}` placeholders. Missing keys fall back to English. */
export function translate(
  locale: Locale,
  key: DictKey,
  vars?: Record<string, string | number>,
): string {
  const dict = DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
  let out = dict[key] ?? DICTIONARIES[DEFAULT_LOCALE][key] ?? String(key);
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.replaceAll(`{${k}}`, String(v));
    }
  }
  return out;
}
