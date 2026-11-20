/**
 * Helpers for the project collection that do not need Astro, so they can be
 * unit tested on their own.
 */
import { technologyGroups, type Technology } from "../data/technologies";
import type { ProjectStatus } from "./project-schema";

/**
 * The text of a project's status tag.
 * - live: "Live".
 * - early with a pre-release tag: "0.1.0-alpha" becomes "Alpha · 0.1.0".
 * - early without one: "0.3.0" becomes "v0.3.0".
 */
export function statusLabel(status: ProjectStatus): string {
  if (status.kind === "live") return "Live";
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

/** A group of technologies as shown on screen. */
export interface TechnologyGroup {
  readonly title: string;
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
      title: group.title,
      items: group.items.filter((item) => used.has(item)),
    }))
    .filter((group) => group.items.length > 0);
}

/** The filter's buttons: every technology in some project's stack, in catalog order. */
export function filterTechnologies(projects: readonly UsesTechnologies[]): Technology[] {
  const used = new Set(projects.flatMap((project) => project.stack));
  return technologyGroups.flatMap((group) => group.items.filter((item) => used.has(item)));
}
