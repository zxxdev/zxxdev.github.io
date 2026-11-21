/**
 * Projects made from GitHub alone. Every public repository the site lists on
 * its own (see isListedAutomatically) and that has no project file becomes a
 * project here, from what GitHub says about it: description, topics,
 * languages and latest release. Nothing is typed by hand, so a new repository
 * appears on the site at its next build.
 *
 * A project file in src/content/projects/ always wins: it is how a project
 * gets its own text, tone and screenshot.
 *
 * Pure functions with no Astro, so the tests can check them directly.
 */
import { technologyNames, technologySlug, type Technology } from "../data/technologies";
import type { Tone } from "../data/tones";
import { statsKey, type Release, type RepositoryStats } from "./github";
import { isVersion, type Project, type ProjectStatus } from "./project-schema";

/** A project made from GitHub: an id for its address, and the same data a project file has. */
export interface AutoProject {
  readonly id: string;
  readonly data: Project;
  /** The full description, shown on the project's page (the card shows `summary`). */
  readonly description: string | null;
}

/**
 * Topics that say what kind of project it is, and so its tone. The first
 * topic of the repository found here decides; without one, cobalt.
 */
export const toneByTopic: Readonly<Record<string, Tone>> = {
  website: "violet",
  frontend: "violet",
  portfolio: "violet",
  "personal-website": "violet",
  api: "cobalt",
  backend: "cobalt",
  infrastructure: "teal",
  platform: "teal",
  devops: "teal",
  terraform: "teal",
  ansible: "teal",
  kubernetes: "teal",
  "world-of-warcraft": "amber",
  "wow-addon": "amber",
  game: "amber",
  cli: "amber",
};
const DEFAULT_TONE: Tone = "cobalt";

/** Longest summary on a card, as for project files. */
export const SUMMARY_LENGTH = 140;
/** A language under this share of the code is not named on the card. */
const MIN_LANGUAGE_SHARE = 0.1;
/** Most technologies on a card, as for project files. */
const MAX_STACK = 5;
/** After every project file, whatever their `order`. */
const FIRST_AUTOMATIC_ORDER = 1000;

/** "RetailArenaCountdown" → "retail-arena-countdown", "zxxdev.github.io" → "zxxdev-github-io". */
export function projectId(repositoryName: string): string {
  return repositoryName
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** A technology the site knows, if `name` (a language or a topic) is one. */
function knownTechnology(name: string): Technology | undefined {
  const slug = technologySlug(name);
  return technologyNames.find((technology) => technologySlug(technology) === slug);
}

/** Languages with a real share of the code first, then topics that name a technology. */
export function stackOf(stats: RepositoryStats): Technology[] {
  const found = [
    ...stats.languages
      .filter((language) => language.share >= MIN_LANGUAGE_SHARE)
      .map((language) => knownTechnology(language.name)),
    ...stats.topics.map(knownTechnology),
  ].filter((technology): technology is Technology => technology !== undefined);
  return [...new Set(found)].slice(0, MAX_STACK);
}

export function toneOf(topics: readonly string[]): Tone {
  for (const topic of topics) {
    const tone = toneByTopic[topic];
    if (tone) return tone;
  }
  return DEFAULT_TONE;
}

/** The latest release's version ("v1.0.0" → 1.0.0), or "in development" without one. */
export function statusOf(release: Release | null): ProjectStatus {
  const version = release?.tag.replace(/^v/, "");
  return version !== undefined && isVersion(version)
    ? { kind: "early", version }
    : { kind: "development" };
}

/**
 * The description if it fits on a card; else its first sentence if that
 * fits; else the description cut at a word.
 */
export function summaryOf(description: string | null): string {
  const text = description?.trim() || "No description on GitHub yet.";
  if (text.length <= SUMMARY_LENGTH) return text;
  const firstSentence = /^.+?[.!?](?=\s)/.exec(text)?.[0];
  if (firstSentence && firstSentence.length <= SUMMARY_LENGTH) return firstSentence;
  const cut = text.slice(0, SUMMARY_LENGTH - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.(-]+$/, "")}…`;
}

/**
 * Topics that read well under the name on a generated cover, in the order
 * they are used: where the project runs first, then what it is. GitHub lists
 * topics alphabetically, so the order has to come from here.
 */
export const captionLabels: readonly (readonly [topic: string, label: string])[] = [
  ["wow-3-3-5a", "wow 3.3.5a"],
  ["wow-forever", "wow forever"],
  ["github-pages", "github pages"],
  ["wow-addon", "addon"],
  ["addon", "addon"],
  ["cli", "command line"],
  ["api", "api"],
  ["website", "website"],
];

/**
 * The words under the name on the generated cover: two labels from
 * captionLabels, or else two topics that are not technologies or tones.
 */
export function captionOf(topics: readonly string[]): string {
  const present = new Set(topics);
  const labels = [
    ...new Set(captionLabels.filter(([topic]) => present.has(topic)).map(([, label]) => label)),
  ];
  const words =
    labels.length > 0
      ? labels
      : topics
          .filter((topic) => !knownTechnology(topic) && !(topic in toneByTopic))
          .map((topic) => topic.replace(/-/g, " "));
  const caption = words.slice(0, 2);
  return caption.length > 0 ? caption.join(" · ") : "on github";
}

/**
 * A project for every repository in `stats` that has no project file, newest
 * push first, after the project files. `stats` holds only the project files'
 * repositories and those the site lists on its own (fetchGitHubSnapshot sees
 * to that). `curatedRepositories` are the project files' owner/name;
 * `takenIds` their ids, so an address is never used twice.
 */
export function autoProjects(
  stats: Readonly<Record<string, RepositoryStats>>,
  curatedRepositories: readonly string[],
  takenIds: readonly string[],
): AutoProject[] {
  const curated = new Set(curatedRepositories.map(statsKey));
  const taken = new Set(takenIds);
  const projects: AutoProject[] = [];

  const candidates = Object.values(stats)
    .filter((repository) => !curated.has(statsKey(repository.fullName)))
    .sort((a, b) => b.pushedAt.localeCompare(a.pushedAt) || a.fullName.localeCompare(b.fullName));

  for (const repository of candidates) {
    const name = repository.fullName.split("/")[1] ?? repository.fullName;
    const id = projectId(name);
    if (id === "" || taken.has(id)) continue;
    taken.add(id);
    const tone = toneOf(repository.topics);
    projects.push({
      id,
      description: repository.description,
      data: {
        title: name,
        repo: repository.fullName,
        summary: summaryOf(repository.description),
        tone,
        status: statusOf(repository.latestRelease),
        stack: stackOf(repository),
        tooling: [],
        cover: {
          kind: "generated",
          caption: captionOf(repository.topics),
          art: tone === "violet" ? "browser" : "arrow",
        },
        featured: false,
        order: FIRST_AUTOMATIC_ORDER + projects.length,
      },
    });
  }
  return projects;
}
