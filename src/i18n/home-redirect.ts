/**
 * Whether the English home page should send the visitor to the Spanish one
 * (ADR 0007). It runs in the browser before the page is drawn, as an inline
 * script, so BaseLayout writes this very function into the page with
 * toString(). That is why it must use nothing from outside its own body (no
 * imports, no constants of this file): everything comes in through `visit`.
 * A unit test rebuilds it from its text and runs it, so a function that broke
 * this rule would fail there.
 *
 * It says yes only when all of these hold:
 * - the visitor has not chosen a language with the switch (`saved`), or chose
 *   Spanish;
 * - with no choice, the browser lists Spanish before English
 *   (`languages`, navigator.languages; "es-MX" counts as Spanish);
 * - they did not arrive from another page of this site (`referrer`), so moving
 *   around never changes the language on its own. Other repositories' Pages
 *   sites share this origin (zxxdev.github.io/<repo>/), so the referrer's path
 *   must also be one of the site's own (`sitePaths`).
 */
export interface HomeVisit {
  /** The language saved by the switch (localStorage), or null. */
  readonly saved: string | null;
  /** The browser's languages, in order of preference. */
  readonly languages: readonly string[];
  /** document.referrer: "" when there is none. */
  readonly referrer: string;
  /** This page's origin, such as "https://zxxdev.github.io". */
  readonly origin: string;
  /** Where the site's pages start ("/", "/projects/", "/es/"…): every other path is not ours. */
  readonly sitePaths: readonly string[];
}

export function opensSpanishHome(visit: HomeVisit): boolean {
  let wanted = visit.saved;
  if (wanted !== "en" && wanted !== "es") {
    wanted = "en";
    for (const language of visit.languages) {
      const main = language.toLowerCase().split("-")[0];
      if (main === "en" || main === "es") {
        wanted = main;
        break;
      }
    }
  }
  if (wanted !== "es") return false;
  if (visit.referrer === "") return true;
  let from;
  try {
    from = new URL(visit.referrer);
  } catch {
    return true;
  }
  const path = from.pathname;
  const fromThisSite =
    from.origin === visit.origin &&
    visit.sitePaths.some((start) => (start === "/" ? path === "/" : path.startsWith(start)));
  return !fromThisSite;
}
