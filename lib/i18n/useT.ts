"use client";

import { useCallback } from "react";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { dictionaries, type Locale, type TranslationKey } from "./dictionaries";

/**
 * Translation hook.
 *
 *   const t = useT();
 *   <h1>{t("login.btn.signin")}</h1>
 *
 * Missing keys fall back to ru → en → key as string.
 */
export function useT() {
  const locale = useSettingsStore((s) => s.locale);
  return useCallback(
    (key: TranslationKey): string => {
      const dict = dictionaries[locale] ?? dictionaries.ru;
      return (
        dict[key] ??
        dictionaries.ru[key] ??
        dictionaries.en[key as keyof (typeof dictionaries)["en"]] ??
        (key as string)
      );
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
