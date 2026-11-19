/**
 * Content for the home and About pages, kept apart from the markup so the
 * pages only decide how things look.
 *
 * Privacy rule for everything in this file: no employers, city, dates or real
 * name. The story is told in a generic way on purpose.
 */

/** One step of the path on the About page. The order here is the order lived. */
export interface PathStage {
  readonly title: string;
  readonly summary: string;
}

export const path: readonly PathStage[] = [
  {
    title: "User support",
    summary:
      "Solving problems for the people who use the systems. This is where you learn what actually breaks.",
  },
  {
    title: "Systems administration",
    summary: "Keeping servers, networks, accounts and permissions running.",
  },
  {
    title: "Web development",
    summary: "Websites from start to finish.",
  },
  {
    title: "Now",
    summary: "Backend services and platforms: the projects on this site.",
  },
];

/**
 * Colour tones, a closed list: one per kind of project, so colour means
 * something. The values live in global.css under [data-tone]. A tone that is
 * not in this list is a type error.
 * - violet: web and front end (also the site's identity)
 * - cobalt: backend services and APIs
 * - teal: platform and infrastructure
 * - amber: tools and games
 */
export type Tone = "violet" | "cobalt" | "teal" | "amber";

/** Line icons drawn by the Icon component. */
export type IconName = "check" | "document" | "person" | "badge";

/**
 * Microsoft exams passed. The certifications they led to have expired, so the
 * site says "exams passed" and never "certified". The names are the official
 * exam titles; a retired exam is marked as such.
 */
export interface Exam {
  readonly code: string;
  /** Short plain-language area, used as the card title. */
  readonly area: string;
  /** The official exam title. */
  readonly name: string;
  readonly retired: boolean;
}

export const azureExams: readonly Exam[] = [
  {
    code: "AZ-104",
    area: "Azure administration",
    name: "Microsoft Azure Administrator",
    retired: false,
  },
  {
    code: "AZ-700",
    area: "Azure networking",
    name: "Designing and Implementing Microsoft Azure Networking Solutions",
    retired: false,
  },
  {
    code: "AZ-304",
    area: "Azure architecture design",
    name: "Microsoft Azure Architect Design",
    retired: true,
  },
];

/** One of the "How I work" points, shared with the GitHub profile. */
export interface Principle {
  readonly title: string;
  readonly text: string;
  readonly tone: Tone;
  readonly icon: IconName;
}

export const principles: readonly Principle[] = [
  {
    title: "Tested by default.",
    text: "Every repo has CI, and the progress badges are computed by the pipeline, never typed by hand.",
    // Teal: the same colour as "CI is green".
    tone: "teal",
    icon: "check",
  },
  {
    title: "Decisions written down.",
    text: "Important technical choices are recorded as short ADRs, including what they cost.",
    tone: "cobalt",
    icon: "document",
  },
  {
    title: "AI-assisted, human-reviewed.",
    text: "The code in these projects is written by AI agents under my direction. I decide what gets built, review every change and answer for every decision. Nothing reaches the main branch without passing tests and CI.",
    tone: "violet",
    icon: "person",
  },
];

/**
 * Technologies, grouped. Only what shows up in a published repo goes here.
 * Once project pages exist (WEB-04), this list is built from them instead.
 */
export interface TechnologyGroup {
  readonly title: string;
  readonly items: readonly string[];
}

export const technologies: readonly TechnologyGroup[] = [
  { title: "Languages", items: ["TypeScript", "Lua", "Go"] },
  { title: "Web", items: ["Astro", "Tailwind CSS"] },
  { title: "Testing and code quality", items: ["ESLint", "Prettier", "luacheck", "busted"] },
  { title: "CI and supply chain", items: ["GitHub Actions", "CodeQL", "Dependabot", "pnpm"] },
];

/**
 * Where a project stands. "live" is published and in use as it is; "early" is
 * an alpha or a first version, and carries the version string exactly as the
 * project declares it (for example "0.1.0-alpha"). The card's label is built
 * from it by statusLabel(), so it is never typed by hand.
 */
export type ProjectStatus =
  { readonly kind: "live" } | { readonly kind: "early"; readonly version: string };

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

/** The drawing on a generated cover, until the project has a screenshot. */
export type CoverArt = "browser" | "arrow";

/** Projects shown on the home page. Until WEB-04 brings project pages, they live here. */
export interface FeaturedProject {
  readonly title: string;
  /** owner/name on GitHub, shown under the title. */
  readonly repo: string;
  /** Short enough not to be cut: 140 characters at most. */
  readonly summary: string;
  readonly href: string;
  readonly stack: readonly string[];
  readonly tone: Tone;
  readonly status: ProjectStatus;
  readonly cover: { readonly caption: string; readonly art: CoverArt };
}

export const featuredProjects: readonly FeaturedProject[] = [
  {
    title: "Portfolio site",
    repo: "zxxdev/zxxdev.github.io",
    summary:
      "This site: a static portfolio with a design built on tokens, light and dark theme, and CI that checks every change before it is published.",
    href: "https://github.com/zxxdev/zxxdev.github.io",
    stack: ["Astro", "TypeScript", "Tailwind CSS", "GitHub Actions"],
    tone: "violet",
    status: { kind: "live" },
    cover: { caption: "astro · static · github pages", art: "browser" },
  },
  {
    title: "TrailMate",
    repo: "zxxdev/TrailMate",
    summary:
      "A leveling coach addon for World of Warcraft: Forever, with quest guides, its own arrow and map marks, talents and dungeons.",
    href: "https://github.com/zxxdev/TrailMate",
    stack: ["Lua", "Go", "luacheck", "busted"],
    tone: "amber",
    // As declared in the addon's TrailMate.toc ("## Version: 0.1.0-alpha").
    status: { kind: "early", version: "0.1.0-alpha" },
    cover: { caption: "wow forever · leveling coach", art: "arrow" },
  },
];
