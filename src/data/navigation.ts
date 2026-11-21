/** The main navigation and the site's outside links. Paths come from src/i18n/routes.ts. */
import type { Locale } from "../i18n/locales";
import { pagePaths, type PageKey } from "../i18n/routes";
import { ui } from "../i18n/ui";

export interface NavItem {
  readonly href: string;
  readonly label: string;
}

/** The pages in the main menu. Order here is the order on screen. */
const menu: readonly PageKey[] = ["home", "projects", "about"];

/** The main menu in `locale`. */
export function navigation(locale: Locale): NavItem[] {
  return menu.map((page) => ({ href: pagePaths[locale][page], label: ui[locale].nav[page] }));
}

export const repositoryUrl = "https://github.com/zxxdev/zxxdev.github.io";
export const profileUrl = "https://github.com/zxxdev";
