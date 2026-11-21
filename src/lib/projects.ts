/**
 * Helpers for the project collection that do not need Astro, so they can be
 * unit tested on their own.
 */
import { technologyGroups, type Technology, type TechnologyGroupId } from "../data/technologies";
import type { Locale } from "../i18n/locales";
import { ui } from "../i18n/ui";
import type { Project, ProjectStatus, ProjectTranslation } from "./project-schema";

/**
 * A project's data with the words of its translation: title (if it has one),
 * summary and the cover's text. The rest stays as the English file says.
 */
export function applyTranslation(project: Project, translation: ProjectTranslation): Project {
  const cover: Project["cover"] =
    project.cover.kind === "generated"
      ? { ...project.cover, caption: translation.cover }
      : { ...project.cover, alt: translation.cover };
  return {
    ...project,
    title: translation.title ?? project.title,
    summary: translation.summary,
    cover,
  };
}

/**
 * The text of a project's status tag.
 * - live: "Live" ("Publicado").
 * - early with a pre-release tag: "0.1.0-alpha" becomes "Alpha · 0.1.0" in
 *   every language: the tag is the project's own word.
 * - early without one: "0.3.0" becomes "v0.3.0".
 * - development: "In development" ("En desarrollo").
 */
export function statusLabel(status: ProjectStatus, locale: Locale): string {
  if (status.kind === "live") return ui[locale].status.live;
  if (status.kind === "development") return ui[locale].status.development;
  const [core = status.version, pre] = status.version.split("-", 2);
  if (!pre) return `v${core}`;
  return `${pre.charAt(0).toUpperCase()}${pre.slice(1)} · ${core}`;
}

/** Projects in their list order: `order` first, then title, so ties are stable. */
export function sortProjects<T extends { readonly data: { order: number; title: string } }>(
  projects: readonly T[],
): T[] {
  return [...projects].sort(
    (a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title, "en"),
  );
}

interface UsesTechnologies {
  readonly stack: readonly Technology[];
  readonly tooling: readonly Technology[];
}

/** A group of technologies as shown on screen. Its title is ui[locale].technologyGroups[id]. */
export interface TechnologyGroup {
  readonly id: TechnologyGroupId;
  readonly items: readonly Technology[];
}

/**
 * The technology groups, keeping only what at least one project uses (in its
 * stack or its tooling). Groups and names stay in catalog order; a group with
 * nothing left is dropped.
 */
export function technologiesInUse(projects: readonly UsesTechnologies[]): TechnologyGroup[] {
  const used = new Set(projects.flatMap((project) => [...project.stack, ...project.tooling]));
  return technologyGroups
    .map((group) => ({
      id: group.id,
      items: group.items.filter((item) => used.has(item)),
    }))
    .filter((group) => group.items.length > 0);
}

/**
 * The filter's buttons: the technologies in some project's stack that belong
 * to a group marked `filter` (languages and frameworks, not shared tooling),
 * in catalog order.
 */
export function filterTechnologies(projects: readonly UsesTechnologies[]): Technology[] {
  const used = new Set(projects.flatMap((project) => project.stack));
  return technologyGroups
    .filter((group) => group.filter)
    .flatMap((group) => group.items.filter((item) => used.has(item)));
}
