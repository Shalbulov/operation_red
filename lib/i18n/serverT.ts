import { dictionaries, type Locale, type TranslationKey } from "./dictionaries";

const VALID_LOCALES: Locale[] = ["ru", "en", "kz"];

export function isValidLocale(x: unknown): x is Locale {
  return typeof x === "string" && (VALID_LOCALES as string[]).includes(x);
}

export function parseLocale(input: unknown): Locale {
  return isValidLocale(input) ? input : "ru";
}

/**
 * Server-side translation with parameter interpolation:
 *   tServer("ru", "solver.probability", { pct: 32 })
 *     → "Вероятность мины ≈ 32%. ..."
 */
export function tServer(
  locale: Locale,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  const dict = dictionaries[locale] ?? dictionaries.ru;
  let s: string =
    dict[key] ??
    dictionaries.ru[key] ??
    (key as string);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return s;
}
