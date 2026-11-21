/**
 * The site's languages. English is the default: its pages keep the addresses
 * they had before the Spanish version existed (/, /projects/, /about/), so no
 * link already shared breaks. Spanish pages live under /es/. See ADR 0007.
 */
export const locales = ["en", "es"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Where the visitor's choice from the language switch is remembered. */
export const languageStorageKey = "lang";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/** The other language: the one the language switch offers. */
export function otherLocale(locale: Locale): Locale {
  return locale === "en" ? "es" : "en";
}
