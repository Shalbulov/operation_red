"use client";

import { useCallback } from "react";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { dictionaries, type Locale, type TranslationKey } from "./dictionaries";

/**
 * Translation hook with optional `{name}` interpolation.
 *
 *   const t = useT();
 *   <p>{t("tut.progress", { n: 3, total: 7 })}</p>
 *
 * Missing keys fall back to ru → en → key as string.
 */
export function useT() {
  const locale = useSettingsStore((s) => s.locale);
  return useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const dict = dictionaries[locale] ?? dictionaries.ru;
      let s: string =
        dict[key] ??
        dictionaries.ru[key] ??
        dictionaries.en[key as keyof (typeof dictionaries)["en"]] ??
        (key as string);
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return s;
    },
    [locale],
  );
}

/** Imperative version (rarely useful — toast messages, etc.). */
export function getT(locale: Locale) {
  const dict = dictionaries[locale] ?? dictionaries.ru;
  return (key: TranslationKey): string =>
    dict[key] ?? dictionaries.ru[key] ?? (key as string);
}
