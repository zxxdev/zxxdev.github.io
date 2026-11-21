/**
 * How dates and shares are written on the site, in each language. Dates are
 * fixed when the page is built, so they are absolute ("18 Nov 2026",
 * "18 nov 2026"), never "3 days ago", which would be wrong a week later. They
 * use UTC, so the build machine's time zone does not change the day.
 */
import type { Locale } from "../i18n/locales";

/** The regional format of each language: British English, and Spanish from Spain. */
const formatLocales: Readonly<Record<Locale, string>> = { en: "en-GB", es: "es-ES" };

const dateFormats = new Map<Locale, Intl.DateTimeFormat>();

function dateFormat(locale: Locale): Intl.DateTimeFormat {
  let format = dateFormats.get(locale);
  if (!format) {
    format = new Intl.DateTimeFormat(formatLocales[locale], {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
    dateFormats.set(locale, format);
  }
  return format;
}

/** "2026-11-18T21:18:02Z" becomes "18 Nov 2026" in English and "18 nov 2026" in Spanish. */
export function formatDate(iso: string, locale: Locale): string {
  return dateFormat(locale).format(new Date(iso));
}

/** The date part of an ISO time, for the datetime attribute of <time>. */
export function isoDate(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * A share from 0 to 1 as a percentage with one decimal: 0.7843 becomes
 * "78.4%" in English and "78,4 %" in Spanish, which writes a decimal comma and
 * a (non-breaking) space before the sign. A share that is not zero never shows
 * as zero.
 */
export function formatShare(share: number, locale: Locale): string {
  const format = new Intl.NumberFormat(formatLocales[locale], {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  if (share > 0 && share < 0.001) return `<${format.format(0.001)}`;
  return format.format(share);
}
