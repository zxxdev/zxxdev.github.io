/**
 * Data about the account's repositories, from the GitHub REST API, fetched
 * while the site is built (never in the visitor's browser).
 *
 * - Every answer is checked against a small schema before it is used: a field
 *   that changed shape is an error, not a blank on the page.
 * - If anything fails (network, timeout, rate limit, a bad answer), the caller
 *   gets the saved copy in src/data/github-snapshot.json instead, so a problem
 *   at GitHub never stops a deployment. It is all or nothing: a page never
 *   mixes fresh and saved numbers.
 * - fetch is passed in, so the tests can play the API without the network.
 *
 * This file imports nothing from the rest of src/, so the snapshot script can
 * run it directly with Node.
 */
import { z } from "astro/zod";

export const ACCOUNT = "zxxdev";
const API = "https://api.github.com";

/** How long one request may take before the whole fetch gives up. */
export const DEFAULT_TIMEOUT_MS = 5000;

// Only the fields the site uses. Anything else in the answer is ignored.
const repositorySchema = z.object({
  name: z.string().min(1),
  full_name: z.string().min(1),
  pushed_at: z.iso.datetime(),
  stargazers_count: z.number().int().nonnegative(),
  fork: z.boolean(),
});
const repositoryListSchema = z.array(repositorySchema);
/** Language name → bytes of code in it, as GitHub's linguist counts them. */
const languagesSchema = z.record(z.string(), z.number().int().nonnegative());
const releaseSchema = z.object({
  tag_name: z.string().min(1),
  html_url: z.url(),
  published_at: z.iso.datetime().nullable(),
});

/** One language and its share of the repository's code, from 0 to 1. */
export interface LanguageShare {
  readonly name: string;
  readonly share: number;
}

export interface Release {
  readonly tag: string;
  readonly url: string;
  readonly publishedAt: string | null;
}

/** What the site shows about one repository. */
export interface RepositoryStats {
  /** owner/name, as GitHub spells it. */
  readonly fullName: string;
  /** Last push to any branch, ISO 8601. */
  readonly pushedAt: string;
  readonly stars: number;
  readonly languages: readonly LanguageShare[];
  readonly latestRelease: Release | null;
}

/** Everything fetched in one build, or kept in the saved copy. */
export interface GitHubSnapshot {
  /** When the data was fetched, ISO 8601. */
  readonly fetchedAt: string;
  /** Names of the account's public repositories, forks left out. */
  readonly repositories: readonly string[];
  /** Keyed by owner/name in lower case. */
  readonly stats: Readonly<Record<string, RepositoryStats>>;
}

export interface GitHubData extends GitHubSnapshot {
  /** "live" when fetched in this build, "snapshot" when the saved copy was used. */
  readonly source: "live" | "snapshot";
}

/** The shape of the saved copy, checked when it is read. */
export const snapshotSchema = z.strictObject({
  fetchedAt: z.iso.datetime(),
  repositories: z.array(z.string().min(1)),
  stats: z.record(
    z.string(),
    z.strictObject({
      fullName: z.string().min(1),
      pushedAt: z.iso.datetime(),
      stars: z.number().int().nonnegative(),
      languages: z.array(
        z.strictObject({ name: z.string().min(1), share: z.number().min(0).max(1) }),
      ),
      latestRelease: z
        .strictObject({
          tag: z.string().min(1),
          url: z.url(),
          publishedAt: z.iso.datetime().nullable(),
        })
        .nullable(),
    }),
  ),
});

/** A failure talking to GitHub. The message says which request and why. */
export class GitHubError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitHubError";
  }
}

/** The key used in `stats`: owner/name in lower case (GitHub names ignore case). */
export function statsKey(fullName: string): string {
  return fullName.toLowerCase();
}

/**
 * Byte counts → shares, largest first. Languages under `minShare` are added
 * up into "Other", so a stray script does not get its own line. The shares
 * are what the bytes say; they are rounded only when shown.
 */
export function languageShares(
  bytes: Readonly<Record<string, number>>,
  minShare = 0.02,
): LanguageShare[] {
  const total = Object.values(bytes).reduce((sum, value) => sum + value, 0);
  if (total === 0) return [];
  const sorted = Object.entries(bytes)
    .map(([name, value]) => ({ name, share: value / total }))
    .sort((a, b) => b.share - a.share || a.name.localeCompare(b.name, "en"));
  const kept = sorted.filter((language) => language.share >= minShare);
  const other = sorted
    .filter((language) => language.share < minShare)
    .reduce((sum, language) => sum + language.share, 0);
  return other > 0 ? [...kept, { name: "Other", share: other }] : kept;
}

export interface FetchOptions {
  /** The fetch to use; the tests pass a fake one. */
  readonly fetch?: typeof fetch;
  /** A token raises the limit from 60 to 5,000 requests an hour. Read-only is enough. */
  readonly token?: string | undefined;
  readonly timeoutMs?: number;
  readonly now?: () => Date;
}

/** One GET to the API. `allowNotFound` turns a 404 into null (a repo with no release). */
async function getJson(
  path: string,
  options: FetchOptions,
  allowNotFound = false,
): Promise<unknown> {
  const doFetch = options.fetch ?? fetch;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": `${ACCOUNT}-site-build`,
  };
  if (options.token) headers["Authorization"] = `Bearer ${options.token}`;

  let response: Response;
  try {
    response = await doFetch(`${API}${path}`, {
      headers,
      signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new GitHubError(`GET ${path}: no answer (${reason})`);
  }
  if (allowNotFound && response.status === 404) return null;
  if (!response.ok) {
    const remaining = response.headers.get("x-ratelimit-remaining");
    const limited = remaining === "0" ? ", rate limit reached" : "";
    throw new GitHubError(`GET ${path}: HTTP ${String(response.status)}${limited}`);
  }
  // Reading the body can fail too (not JSON, or cut off by the timeout): that is
  // a GitHub problem like any other, so it must lead to the saved copy.
  try {
    return (await response.json()) as unknown;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new GitHubError(`GET ${path}: unreadable answer (${reason})`);
  }
}

/** Checks an answer against its schema, naming the request when it does not fit. */
function parse<T>(schema: z.ZodType<T>, value: unknown, path: string): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    const field = result.error.issues[0]?.path.join(".") ?? "";
    throw new GitHubError(`GET ${path}: unexpected answer${field ? ` at ${field}` : ""}`);
  }
  return result.data;
}

/**
 * Fetches the account's repository list, then languages and latest release
 * for each repository in `fullNames` (owner/name). Throws GitHubError on any
 * failure, so the caller can fall back to the saved copy as a whole.
 *
 * Requests: 1 for the list plus 2 per repository.
 */
export async function fetchGitHubSnapshot(
  fullNames: readonly string[],
  options: FetchOptions = {},
): Promise<GitHubSnapshot> {
  const listPath = `/users/${ACCOUNT}/repos?type=owner&per_page=100`;
  const list = parse(repositoryListSchema, await getJson(listPath, options), listPath);
  const byName = new Map(list.map((repository) => [statsKey(repository.full_name), repository]));

  const stats: Record<string, RepositoryStats> = {};
  for (const fullName of fullNames) {
    const repository = byName.get(statsKey(fullName));
    if (!repository) throw new GitHubError(`${fullName} is not a public repository of ${ACCOUNT}`);

    const languagesPath = `/repos/${repository.full_name}/languages`;
    const releasePath = `/repos/${repository.full_name}/releases/latest`;
    const languages = parse(languagesSchema, await getJson(languagesPath, options), languagesPath);
    const releaseAnswer = await getJson(releasePath, options, true);
    const release =
      releaseAnswer === null ? null : parse(releaseSchema, releaseAnswer, releasePath);

    stats[statsKey(fullName)] = {
      fullName: repository.full_name,
      pushedAt: repository.pushed_at,
      stars: repository.stargazers_count,
      languages: languageShares(languages),
      latestRelease: release
        ? { tag: release.tag_name, url: release.html_url, publishedAt: release.published_at }
        : null,
    };
  }

  return {
    fetchedAt: (options.now?.() ?? new Date()).toISOString(),
    repositories: list
      .filter((repository) => !repository.fork)
      .map((repository) => repository.name)
      .sort((a, b) => a.localeCompare(b, "en")),
    stats,
  };
}

export interface LoadOptions extends FetchOptions {
  /** The saved copy, already read from disk. */
  readonly snapshot: unknown;
  /** True to skip the network and use the saved copy straight away. */
  readonly offline?: boolean;
  /** Where to report that the saved copy was used. */
  readonly warn?: (message: string) => void;
}

/**
 * Live data if GitHub answers, the saved copy if not. Never throws for a
 * GitHub problem; it throws only if the saved copy itself is broken, because
 * then there is nothing true left to show.
 */
export async function loadGitHubData(
  fullNames: readonly string[],
  options: LoadOptions,
): Promise<GitHubData> {
  const saved = snapshotSchema.safeParse(options.snapshot);
  if (!saved.success) throw new Error("src/data/github-snapshot.json does not match its schema");

  if (!options.offline) {
    try {
      return { ...(await fetchGitHubSnapshot(fullNames, options)), source: "live" };
    } catch (error) {
      if (!(error instanceof GitHubError)) throw error;
      options.warn?.(
        `GitHub data: ${error.message}. Using the saved copy from ${saved.data.fetchedAt}.`,
      );
    }
  }
  return { ...saved.data, source: "snapshot" };
}
