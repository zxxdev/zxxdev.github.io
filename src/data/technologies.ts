/**
 * Every technology the site can name, grouped, in the order shown on screen.
 *
 * A closed list: the project schema only accepts these names, so a project that
 * names a technology missing here (or misspells one) fails the build. To use a
 * new technology, add it here first, in its group.
 *
 * The home page lists only the ones that at least one project uses.
 *
 * `filter` marks the groups offered in the filter on the Projects page: what a
 * visitor looks for (a language, a framework), not the tools every repository
 * shares (test runners, CI).
 *
 * The groups' titles are interface text: src/i18n/ui.ts, under
 * technologyGroups, by `id`. Technology names are never translated.
 */
export const technologyGroups = [
  { id: "languages", filter: true, items: ["TypeScript", "Lua", "Go"] },
  { id: "web", filter: true, items: ["Astro", "Tailwind CSS"] },
  {
    id: "quality",
    filter: false,
    items: ["Vitest", "Playwright", "ESLint", "Prettier", "luacheck", "busted"],
  },
  {
    id: "ci",
    filter: false,
    items: ["GitHub Actions", "CodeQL", "Dependabot", "pnpm"],
  },
] as const;

export type Technology = (typeof technologyGroups)[number]["items"][number];

export type TechnologyGroupId = (typeof technologyGroups)[number]["id"];

/** All the names, in screen order. */
export const technologyNames: readonly Technology[] = technologyGroups.flatMap(
  (group) => group.items,
);

/**
 * A name made safe for a URL and an HTML attribute: "Tailwind CSS" becomes
 * "tailwind-css". Used by the filter on the Projects page (?tech=tailwind-css).
 */
export function technologySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
