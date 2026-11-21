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

/**
 * The first of the browser's languages (navigator.languages, in the visitor's
 * order of preference) that the site has, or the default. Only the main part
 * counts: "es-MX" and "es" are both Spanish.
 *
 * The inline script on the English home page repeats this in plain
 * JavaScript, because it must run before the page is drawn
 * (src/layouts/BaseLayout.astro). Change both together.
 */
export function preferredLocale(languages: readonly string[]): Locale {
  for (const language of languages) {
    const main = language.toLowerCase().split("-")[0];
    if (isLocale(main)) return main;
  }
  return defaultLocale;
}
