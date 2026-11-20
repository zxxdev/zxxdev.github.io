/**
 * How dates and shares are written on the site. Dates are fixed when the page
 * is built, so they are absolute ("18 Nov 2026"), never "3 days ago", which
 * would be wrong a week later. They use UTC, so the build machine's time zone
 * does not change the day.
 */
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "2026-11-18T21:18:02Z" becomes "18 Nov 2026". */
export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}

/** The date part of an ISO time, for the datetime attribute of <time>. */
export function isoDate(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * A share from 0 to 1 as a percentage with one decimal: 0.7843 becomes
 * "78.4%". A share that is not zero never shows as "0.0%".
 */
export function formatShare(share: number): string {
  if (share > 0 && share < 0.001) return "<0.1%";
  return `${(share * 100).toFixed(1)}%`;
}
