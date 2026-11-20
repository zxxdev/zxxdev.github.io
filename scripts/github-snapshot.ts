/**
 * Refreshes src/data/github-snapshot.json, the saved copy of GitHub data that
 * the build falls back to when the API does not answer.
 *
 *   pnpm github:snapshot
 *
 * It asks the same API the build asks, for the repositories of the project
 * files, and writes only the fields the site shows. GITHUB_TOKEN is optional.
 * Commit the result: the copy is only as fresh as its last commit, and its date
 * is shown on the site when it is used.
 *
 * Node runs this TypeScript file directly (type stripping), with no build step.
 */
import { writeFile } from "node:fs/promises";
import { fetchGitHubSnapshot } from "../src/lib/github.ts";
import { projectRepositories } from "../src/lib/project-files.ts";

const repositories = projectRepositories();
const snapshot = await fetchGitHubSnapshot(repositories, { token: process.env["GITHUB_TOKEN"] });
const out = new URL("../src/data/github-snapshot.json", import.meta.url);
await writeFile(out, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(
  `Saved GitHub data for ${String(repositories.length)} projects (${snapshot.fetchedAt}).`,
);
