/**
 * Every project on the site, in list order: the project files first (they
 * have their own text), then the repositories made into projects from GitHub
 * alone (src/lib/auto-projects.ts). Pages and cards take projects from here,
 * never from the collection directly, so a new repository shows up everywhere
 * at once.
 */
import { getCollection, type CollectionEntry } from "astro:content";
import { autoProjects } from "./auto-projects";
import { getGitHubData } from "./github-data";
import type { Project } from "./project-schema";
import { sortProjects } from "./projects";

export interface SiteProject {
  readonly id: string;
  readonly data: Project;
  /** The project file, when there is one: its body is the project's page. */
  readonly entry?: CollectionEntry<"projects">;
  /** For a project made from GitHub: its full description. */
  readonly description?: string | null;
}

let projects: Promise<SiteProject[]> | undefined;

export function getProjects(): Promise<SiteProject[]> {
  projects ??= (async () => {
    const entries = await getCollection("projects");
    const github = await getGitHubData();
    const curated: SiteProject[] = entries.map((entry) => ({
      id: entry.id,
      data: entry.data,
      entry,
    }));
    const automatic = autoProjects(
      github.stats,
      entries.map((entry) => entry.data.repo),
      entries.map((entry) => entry.id),
      (message) => {
        console.warn(message);
      },
    );
    return sortProjects([...curated, ...automatic]);
  })();
  return projects;
}
