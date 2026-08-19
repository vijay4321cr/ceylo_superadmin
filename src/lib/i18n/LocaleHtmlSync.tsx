"use client";

import { useEffect } from "react";
import { useLocaleStore } from "../stores/localeStore";

/**
 * Keeps `<html lang>` in step with the store so the font-token swap in
 * globals.css (`html[lang|="si"]`) picks the right script face.
 */
export function LocaleHtmlSync() {
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
