/**
 * GitHub serves the Pages site of each of the account's repositories at
 * zxxdev.github.io/<repo>/. If this site had a top-level page or file with a
 * repository's name, the two would clash, so this test fails when one does.
 *
 * Top-level names come from src/pages/ (each file or folder is a route) and
 * from public/ (copied as they are). Repository names come from the account's
 * repository list in the saved GitHub data (src/data/github-snapshot.json,
 * refreshed with `pnpm github:snapshot`) and from the project files, so a
 * project added after the last refresh is covered too. The test reads files
 * only; it never calls GitHub.
 */
import { existsSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import snapshot from "../src/data/github-snapshot.json";
import { snapshotSchema, statsKey } from "../src/lib/github";
import { projectFiles, projectRepositories } from "../src/lib/project-files";

const pagesDir = new URL("../src/pages/", import.meta.url);
const publicDir = new URL("../public/", import.meta.url);

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

/** Names in both lists, ignoring case (Pages paths should not rely on case). */
function collisions(routes: readonly string[], repositories: readonly string[]) {
  const taken = new Set(repositories.map((name) => name.toLowerCase()));
  return routes.filter((route) => taken.has(route.toLowerCase()));
}

/** Every repository name the account is known to have. */
function accountRepositories(): string[] {
  const saved = snapshotSchema.parse(snapshot);
  const fromProjects = projectRepositories().map((fullName) => fullName.split("/")[1] ?? fullName);
  return [...saved.repositories, ...fromProjects];
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

  it("reads a repository from every project file", () => {
    expect(projectFiles().length).toBeGreaterThan(0);
    expect(projectRepositories()).toHaveLength(projectFiles().length);
  });

  it("has GitHub figures for every project in the saved copy", () => {
    // Otherwise a new project would show no GitHub data whenever GitHub is down.
    const saved = snapshotSchema.parse(snapshot);
    const missing = projectRepositories().filter(
      (fullName) => !(statsKey(fullName) in saved.stats),
    );
    expect(missing, "run pnpm github:snapshot and commit the result").toEqual([]);
  });

  it("knows the account's repositories from the saved GitHub data", () => {
    // The profile repository has no project file: it can only come from the list.
    expect(snapshotSchema.parse(snapshot).repositories).toContain("zxxdev");
  });

  it("has no dynamic route at the top level", () => {
    // A top-level [slug].astro or [...rest].astro would answer any /<name>/,
    // including every repository's address, and its name never matches one.
    const dynamic = topLevelNames(entriesOf(pagesDir), []).filter((name) => name.startsWith("["));
    expect(dynamic).toEqual([]);
  });

  it("never uses the name of one of the account's repositories", () => {
    const routes = topLevelNames(entriesOf(pagesDir), entriesOf(publicDir));
    expect(collisions(routes, accountRepositories())).toEqual([]);
  });
});
