/**
 * GitHub serves the Pages site of each of the account's repositories at
 * zxxdev.github.io/<repo>/. If this site had a top-level page or file with a
 * repository's name, the two would clash, so this test fails when one does.
 *
 * Top-level names come from src/pages/ (each file or folder is a route) and
 * from public/ (copied as they are). Repository names come from the project
 * files and from the account's profile repository. Until the site reads the
 * account's full repository list from the GitHub API, a repository with no
 * project file here is not covered.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pagesDir = new URL("../src/pages/", import.meta.url);
const publicDir = new URL("../public/", import.meta.url);
const projectsDir = new URL("../src/content/projects/", import.meta.url);

/** The profile repository (zxxdev/zxxdev): it has no project file. */
const accountRepositories = ["zxxdev"];

/** "about.astro" is served as /about/, "projects" as /projects/... */
function topLevelNames(pageEntries: readonly string[], publicEntries: readonly string[]) {
  const pages = pageEntries
    // Files starting with _ are not routes.
    .filter((name) => !name.startsWith("_"))
    .map((name) => name.replace(/\.(astro|md|mdx|html|ts|js)$/, ""));
  return [...pages, ...publicEntries];
}

/** The entries of a folder, or none if it does not exist (public/ is optional). */
function entriesOf(dir: URL): string[] {
  return existsSync(dir) ? readdirSync(dir) : [];
}

const projectFiles = readdirSync(projectsDir).filter((name) => name.endsWith(".md"));

/** The repository name of each project file, from its `repo: owner/name` line. */
function projectRepositories(): string[] {
  return projectFiles.map((file) => {
    const text = readFileSync(new URL(file, projectsDir), "utf8");
    const match = /^repo:\s*["']?[\w.-]+\/([\w.-]+?)["']?\s*$/m.exec(text);
    // A file the test cannot read must fail, not be skipped without a word.
    if (!match?.[1]) throw new Error(`${file}: no "repo: owner/name" line found`);
    return match[1];
  });
}

/** Names in both lists, ignoring case (Pages paths should not rely on case). */
function collisions(routes: readonly string[], repositories: readonly string[]) {
  const taken = new Set(repositories.map((name) => name.toLowerCase()));
  return routes.filter((route) => taken.has(route.toLowerCase()));
}

describe("top-level routes", () => {
  it("finds a clash, ignoring case", () => {
    expect(collisions(["about", "trailmate"], ["TrailMate"])).toEqual(["trailmate"]);
  });

  it("reads routes from page files and folders, skipping private files", () => {
    expect(topLevelNames(["about.astro", "projects", "_draft.astro"], ["favicon.svg"])).toEqual([
      "about",
      "projects",
      "favicon.svg",
    ]);
  });

  it("reads a repository name from every project file", () => {
    expect(projectFiles.length).toBeGreaterThan(0);
    expect(projectRepositories()).toHaveLength(projectFiles.length);
  });

  it("has no dynamic route at the top level", () => {
    // A top-level [slug].astro or [...rest].astro would answer any /<name>/,
    // including every repository's address, and its name never matches one.
    const dynamic = topLevelNames(entriesOf(pagesDir), []).filter((name) => name.startsWith("["));
    expect(dynamic).toEqual([]);
  });

  it("never uses the name of one of the account's repositories", () => {
    const routes = topLevelNames(entriesOf(pagesDir), entriesOf(publicDir));
    const repositories = [...accountRepositories, ...projectRepositories()];
    expect(collisions(routes, repositories)).toEqual([]);
  });
});
