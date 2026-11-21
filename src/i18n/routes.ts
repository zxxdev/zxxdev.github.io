/**
 * Every page's address in every language, written once. Menus, links and the
 * language switch use these, never a literal path.
 *
 * - English pages keep the addresses they had before there was a Spanish
 *   version, so links already shared keep working.
 * - Spanish pages are under /es/, with Spanish words in the address.
 * - A project's page is always under its language's Projects section, never at
 *   the top level: GitHub serves each repository's own Pages site at
 *   zxxdev.github.io/<repo>/, and a top-level page with that name would clash.
 */
import { locales, type Locale } from "./locales";

/** The fixed pages. A project's page is a route of its own (see Route). */
export type PageKey = "home" | "projects" | "about";

export const pagePaths: Readonly<Record<Locale, Readonly<Record<PageKey, string>>>> = {
  en: { home: "/", projects: "/projects/", about: "/about/" },
  es: { home: "/es/", projects: "/es/proyectos/", about: "/es/sobre-mi/" },
};

/** A page of the site, whatever its language. */
export type Route = { readonly page: PageKey } | { readonly page: "project"; readonly id: string };

/** The address of `route` in `locale`. */
export function routePath(locale: Locale, route: Route): string {
  const paths = pagePaths[locale];
  return route.page === "project" ? `${paths.projects}${route.id}/` : paths[route.page];
}

/** A project's page in `locale`. */
export function projectPath(locale: Locale, id: string): string {
  return routePath(locale, { page: "project", id });
}

/** The same page in every language, in the order of `locales`: for hreflang. */
export function alternates(route: Route): { locale: Locale; path: string }[] {
  return locales.map((locale) => ({ locale, path: routePath(locale, route) }));
}

/** Normalises a path so "/about" and "/about/" are treated as the same page. */
export function normalisePath(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

/** True when `href` is the page being shown. */
export function isCurrent(href: string, currentPath: string): boolean {
  return normalisePath(href) === normalisePath(currentPath);
}

const homePaths = new Set(locales.map((locale) => pagePaths[locale].home));

/**
 * True when the page being shown is inside the section `href` opens, such as a
 * project page under Projects. A home page is not a section: every page of its
 * language starts with it.
 */
export function isInSection(href: string, currentPath: string): boolean {
  const section = normalisePath(href);
  return !homePaths.has(section) && normalisePath(currentPath).startsWith(section);
}
