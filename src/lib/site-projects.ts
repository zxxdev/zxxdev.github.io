/**
 * Every project on the site, in list order and in one language: the project
 * files first (they have their own text), then the repositories made into
 * projects from GitHub alone (src/lib/auto-projects.ts). Pages and cards take
 * projects from here, never from the collections directly, so a new repository
 * shows up everywhere at once, in both languages.
 *
 * In Spanish, a project file's words come from its translation in
 * src/content/projects/es/. A project file without one, or a translation
 * without its project file, stops the build. A project made from GitHub keeps
 * its English description: there is nothing to translate it from, so it is
 * marked as English (`lang`) for screen readers and search engines.
 */
import { getCollection, type CollectionEntry } from "astro:content";
import type { Locale } from "../i18n/locales";
import { ui } from "../i18n/ui";
import { autoProjects } from "./auto-projects";
import { statsKey } from "./github";
import { getGitHubData } from "./github-data";
import type { Project } from "./project-schema";
import { applyTranslation, sortProjects, withReleaseVersion } from "./projects";

export interface SiteProject {
  readonly id: string;
  readonly data: Project;
  /** The language its words are in: the page's, or English for a GitHub description. */
  readonly lang: Locale;
  /** The project file (or its translation), when there is one: its body is the project's page. */
  readonly entry?: CollectionEntry<"projects"> | CollectionEntry<"projectsEs">;
  /** For a project made from GitHub: its full description. */
  readonly description?: string | null;
}

const cache = new Map<Locale, Promise<SiteProject[]>>();

export function getProjects(locale: Locale): Promise<SiteProject[]> {
  let projects = cache.get(locale);
  if (!projects) {
    projects = loadProjects(locale);
    cache.set(locale, projects);
  }
  return projects;
}

async function loadProjects(locale: Locale): Promise<SiteProject[]> {
  const entries = await getCollection("projects");
  const github = await getGitHubData();
  // A project file's version is only a fallback: its latest release wins.
  const curated = (
    locale === "en" ? englishProjects(entries) : await spanishProjects(entries)
  ).map(
    (project): SiteProject => ({
      ...project,
      data: {
        ...project.data,
        status: withReleaseVersion(
          project.data.status,
          github.stats[statsKey(project.data.repo)]?.latestRelease?.tag,
        ),
      },
    }),
  );
  const automatic = autoProjects(
    github.stats,
    entries.map((entry) => entry.data.repo),
    entries.map((entry) => entry.id),
    (message) => {
      // Warn once, not once per language.
      if (locale === "en") console.warn(message);
    },
  ).map((project): SiteProject => {
    const described = Boolean(project.description?.trim());
    return {
      ...project,
      // With no description on GitHub, the summary is the site's own sentence.
      data: described ? project.data : { ...project.data, summary: ui[locale].noDescription },
      lang: described ? "en" : locale,
    };
  });
  return sortProjects([...curated, ...automatic]);
}

function englishProjects(entries: readonly CollectionEntry<"projects">[]): SiteProject[] {
  return entries.map((entry) => ({ id: entry.id, data: entry.data, lang: "en", entry }));
}

async function spanishProjects(
  entries: readonly CollectionEntry<"projects">[],
): Promise<SiteProject[]> {
  const translations = new Map(
    (await getCollection("projectsEs")).map((translation) => [translation.id, translation]),
  );
  const ids = new Set(entries.map((entry) => entry.id));
  for (const id of translations.keys()) {
    if (!ids.has(id)) {
      throw new Error(
        `src/content/projects/es/${id}.md has no project file: expected src/content/projects/${id}.md`,
      );
    }
  }
  return entries.map((entry) => {
    const translation = translations.get(entry.id);
    if (!translation) {
      throw new Error(
        `src/content/projects/${entry.id}.md has no Spanish version: add src/content/projects/es/${entry.id}.md`,
      );
    }
    return {
      id: entry.id,
      data: applyTranslation(entry.data, translation.data),
      lang: "es",
      entry: translation,
    };
  });
}
