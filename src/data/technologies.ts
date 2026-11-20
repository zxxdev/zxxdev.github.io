/**
 * Every technology the site can name, grouped, in the order shown on screen.
 *
 * A closed list: the project schema only accepts these names, so a project that
 * names a technology missing here (or misspells one) fails the build. To use a
 * new technology, add it here first, in its group.
 *
 * The home page lists only the ones that at least one project uses.
 */
export const technologyGroups = [
  { title: "Languages", items: ["TypeScript", "Lua", "Go"] },
  { title: "Web", items: ["Astro", "Tailwind CSS"] },
  {
    title: "Testing and code quality",
    items: ["Vitest", "Playwright", "ESLint", "Prettier", "luacheck", "busted"],
  },
  { title: "CI and supply chain", items: ["GitHub Actions", "CodeQL", "Dependabot", "pnpm"] },
] as const;

export type Technology = (typeof technologyGroups)[number]["items"][number];

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
