/**
 * Reads the repository of each project straight from the Markdown files, for
 * code that runs outside Astro (the snapshot script and the route test). Inside
 * the site, use getCollection("projects") instead: it checks the whole schema.
 */
import { readdirSync, readFileSync } from "node:fs";

export const projectsDir = new URL("../content/projects/", import.meta.url);

/** The Spanish versions of the project files, with the same names. */
export const spanishProjectsDir = new URL("../content/projects/es/", import.meta.url);

/** The project files: one Markdown file per project. */
export function projectFiles(dir: URL = projectsDir): string[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort();
}

/**
 * owner/name of every project, from each file's `repo:` line. A file without
 * one is an error, so nothing is skipped without a word.
 */
export function projectRepositories(dir: URL = projectsDir): string[] {
  return projectFiles(dir).map((file) => {
    const text = readFileSync(new URL(file, dir), "utf8");
    const match = /^repo:\s*["']?([\w.-]+\/[\w.-]+?)["']?\s*$/m.exec(text);
    if (!match?.[1]) throw new Error(`${file}: no "repo: owner/name" line found`);
    return match[1];
  });
}
