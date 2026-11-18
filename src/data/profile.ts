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

/** One of the "How I work" points, shared with the GitHub profile. */
export interface Principle {
  readonly title: string;
  readonly text: string;
}

export const principles: readonly Principle[] = [
  {
    title: "Tested by default.",
    text: "Every repo has CI, and the progress badges are computed by the pipeline, never typed by hand.",
  },
  {
    title: "Decisions written down.",
    text: "Important technical choices are recorded as short ADRs, including what they cost.",
  },
  {
    title: "AI-assisted, human-reviewed.",
    text: "The code in these projects is written by AI agents under my direction. I decide what gets built, review every change and answer for every decision. Nothing reaches the main branch without passing tests and CI.",
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

/** Projects shown on the home page. Until WEB-04, only this site. */
export interface FeaturedProject {
  readonly name: string;
  readonly summary: string;
  readonly href: string;
  readonly stack: readonly string[];
}

export const featuredProjects: readonly FeaturedProject[] = [
  {
    name: "zxxdev.github.io",
    summary:
      "This site: a static portfolio with a design built on tokens, light and dark theme, and CI that checks every change before it is published.",
    href: "https://github.com/zxxdev/zxxdev.github.io",
    stack: ["Astro", "TypeScript", "Tailwind CSS", "GitHub Actions"],
  },
];
