/**
 * The GitHub data for this build, fetched once and shared by every page.
 *
 * - GITHUB_TOKEN (optional) is read here, on the machine that builds the site.
 *   It is never written into a page. In GitHub Actions it is the short-lived,
 *   read-only token each workflow run gets; without it the API allows 60
 *   requests an hour, enough for a local build.
 * - GITHUB_DATA=snapshot skips the network and uses the saved copy.
 */
import { getCollection } from "astro:content";
import snapshot from "../data/github-snapshot.json";
import { loadGitHubData, statsKey, type GitHubData, type RepositoryStats } from "./github";

let data: Promise<GitHubData> | undefined;

export function getGitHubData(): Promise<GitHubData> {
  data ??= (async () => {
    const projects = await getCollection("projects");
    return loadGitHubData(
      projects.map((project) => project.data.repo),
      {
        snapshot,
        token: process.env["GITHUB_TOKEN"],
        offline: process.env["GITHUB_DATA"] === "snapshot",
        warn: (message) => {
          console.warn(message);
        },
      },
    );
  })();
  return data;
}

/** The stats of one repository (owner/name), if GitHub data has them. */
export async function repositoryStats(fullName: string): Promise<RepositoryStats | undefined> {
  return (await getGitHubData()).stats[statsKey(fullName)];
}
