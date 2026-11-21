/**
 * The GitHub module, with the API played by a fake fetch: each test decides
 * what "GitHub" answers. No test touches the network.
 */
import { describe, expect, it } from "vitest";
import {
  fetchGitHubSnapshot,
  firstReadmePicture,
  GitHubError,
  languageShares,
  loadGitHubData,
  readmePictureUrl,
  type GitHubSnapshot,
} from "../src/lib/github";
import { formatDate, formatShare, isoDate } from "../src/lib/format";

const now = () => new Date("2026-11-20T18:00:00Z");

const repositoryList = [
  {
    name: "TrailMate",
    full_name: "zxxdev/TrailMate",
    pushed_at: "2026-11-18T21:18:02Z",
    stargazers_count: 3,
    fork: false,
    description: "Leveling coach.",
    topics: ["lua", "world-of-warcraft"],
    license: { key: "mit" }, // ignored: the site only reads the fields it shows
  },
  {
    name: "zxxdev",
    full_name: "zxxdev/zxxdev",
    pushed_at: "2026-11-19T09:16:08Z",
    stargazers_count: 0,
    fork: false,
  },
  {
    name: "someone-elses-tool",
    full_name: "zxxdev/someone-elses-tool",
    pushed_at: "2026-10-01T00:00:00Z",
    stargazers_count: 0,
    fork: true,
  },
];

/** An answer: JSON `body`, or `raw` text sent as it is (to send something that is not JSON). */
type Route =
  { status: number; body?: unknown; raw?: string; headers?: Record<string, string> } | "hang";

/** A fetch that answers from a table of paths, and records what was asked. */
function fakeFetch(routes: Record<string, Route>) {
  const calls: { url: string; headers: Record<string, string> }[] = [];
  const fake = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, headers: (init?.headers ?? {}) as Record<string, string> });
    const path = url.replace("https://api.github.com", "");
    const route = routes[path];
    if (route === "hang") {
      // Wait until the request's own timeout aborts it.
      return new Promise<Response>((_, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(init.signal?.reason instanceof Error ? init.signal.reason : new Error("aborted"));
        });
      });
    }
    if (!route) return new Response("Not Found", { status: 404 });
    return new Response(route.raw ?? JSON.stringify(route.body ?? null), {
      status: route.status,
      headers: route.headers ?? {},
    });
  }) as typeof fetch;
  return { fetch: fake, calls };
}

const healthy: Record<string, Route> = {
  "/users/zxxdev/repos?type=owner&per_page=100&page=1": { status: 200, body: repositoryList },
  "/repos/zxxdev/TrailMate/languages": { status: 200, body: { Lua: 780, Go: 200, Shell: 20 } },
  "/repos/zxxdev/TrailMate/releases/latest": {
    status: 200,
    body: {
      tag_name: "v0.1.0-alpha",
      html_url: "https://github.com/zxxdev/TrailMate/releases/tag/v0.1.0-alpha",
      published_at: "2026-11-18T22:00:00Z",
    },
  },
};

const saved: GitHubSnapshot = {
  fetchedAt: "2026-11-10T08:00:00.000Z",
  repositories: ["TrailMate", "zxxdev"],
  stats: {
    "zxxdev/trailmate": {
      fullName: "zxxdev/TrailMate",
      description: "Leveling coach.",
      topics: [],
      pushedAt: "2026-11-09T10:00:00Z",
      stars: 1,
      languages: [{ name: "Lua", share: 1 }],
      latestRelease: null,
      image: null,
    },
  },
};

describe("fetchGitHubSnapshot", () => {
  it("keeps only the fields the site shows, keyed by lower-case owner/name", async () => {
    const { fetch } = fakeFetch(healthy);
    const result = await fetchGitHubSnapshot(["zxxdev/trailmate"], { fetch, now });
    expect(result).toEqual({
      fetchedAt: "2026-11-20T18:00:00.000Z",
      repositories: ["TrailMate", "zxxdev"],
      stats: {
        "zxxdev/trailmate": {
          fullName: "zxxdev/TrailMate",
          description: "Leveling coach.",
          topics: ["lua", "world-of-warcraft"],
          pushedAt: "2026-11-18T21:18:02Z",
          stars: 3,
          languages: [
            { name: "Lua", share: 0.78 },
            { name: "Go", share: 0.2 },
            { name: "Shell", share: 0.02 },
          ],
          latestRelease: {
            tag: "v0.1.0-alpha",
            url: "https://github.com/zxxdev/TrailMate/releases/tag/v0.1.0-alpha",
            publishedAt: "2026-11-18T22:00:00Z",
          },
          // No README route in this fake GitHub: a 404, so no picture.
          image: null,
        },
      },
    });
  });

  it("takes the first picture of the README that is one of the repository's files", async () => {
    const readme = [
      "# TrailMate",
      "[![CI](https://github.com/zxxdev/TrailMate/actions/workflows/ci.yml/badge.svg)](x)",
      '<p align="center"><img src="docs/images/arrow.png" alt="The arrow in the game."></p>',
      "![Second](docs/images/other.png)",
    ].join("\n");
    const { fetch } = fakeFetch({
      ...healthy,
      "/repos/zxxdev/TrailMate/readme": {
        status: 200,
        body: {
          encoding: "base64",
          content: Buffer.from(readme)
            .toString("base64")
            .replace(/(.{60})/g, "$1\n"),
          download_url: "https://raw.githubusercontent.com/zxxdev/TrailMate/main/README.md",
        },
      },
    });
    const result = await fetchGitHubSnapshot(["zxxdev/TrailMate"], { fetch, now });
    expect(result.stats["zxxdev/trailmate"]?.image).toEqual({
      url: "https://raw.githubusercontent.com/zxxdev/TrailMate/main/docs/images/arrow.png",
      alt: "The arrow in the game.",
    });
  });

  it("leaves forks out of the repository list", async () => {
    const { fetch } = fakeFetch(healthy);
    const result = await fetchGitHubSnapshot([], { fetch, now });
    expect(result.repositories).not.toContain("someone-elses-tool");
  });

  it("fetches the figures of every repository listed on its own, with no project file", async () => {
    // TrailMate is listed on its own; the profile repository and the fork are not.
    const { fetch } = fakeFetch(healthy);
    const result = await fetchGitHubSnapshot([], { fetch, now });
    expect(Object.keys(result.stats)).toEqual(["zxxdev/trailmate"]);
  });

  it("treats a repository with no release as having none, not as an error", async () => {
    const { fetch } = fakeFetch({
      ...healthy,
      "/repos/zxxdev/TrailMate/releases/latest": { status: 404 },
    });
    const result = await fetchGitHubSnapshot(["zxxdev/TrailMate"], { fetch, now });
    expect(result.stats["zxxdev/trailmate"]?.latestRelease).toBeNull();
  });

  it("sends the token only when there is one", async () => {
    const withToken = fakeFetch(healthy);
    await fetchGitHubSnapshot([], { fetch: withToken.fetch, now, token: "test-token" });
    expect(withToken.calls[0]?.headers["Authorization"]).toBe("Bearer test-token");

    const without = fakeFetch(healthy);
    await fetchGitHubSnapshot([], { fetch: without.fetch, now });
    expect(without.calls[0]?.headers["Authorization"]).toBeUndefined();
  });

  it("fails on an HTTP error and says the rate limit was reached", async () => {
    const { fetch } = fakeFetch({
      "/users/zxxdev/repos?type=owner&per_page=100&page=1": {
        status: 403,
        body: { message: "API rate limit exceeded" },
        headers: { "x-ratelimit-remaining": "0" },
      },
    });
    await expect(fetchGitHubSnapshot([], { fetch, now })).rejects.toThrow(
      /HTTP 403, rate limit reached/,
    );
  });

  it("fails as a GitHub problem, not a crash, on an answer that is not JSON", async () => {
    const { fetch } = fakeFetch({
      ...healthy,
      "/repos/zxxdev/TrailMate/languages": { status: 200, raw: "<html>Unicorn!</html>" },
    });
    await expect(fetchGitHubSnapshot(["zxxdev/TrailMate"], { fetch, now })).rejects.toThrow(
      GitHubError,
    );
  });

  it("fails on an answer with a different shape", async () => {
    const { fetch } = fakeFetch({
      ...healthy,
      "/repos/zxxdev/TrailMate/languages": { status: 200, body: { Lua: "a lot" } },
    });
    await expect(fetchGitHubSnapshot(["zxxdev/TrailMate"], { fetch, now })).rejects.toThrow(
      /languages: unexpected answer at Lua/,
    );
  });

  it("fails when GitHub does not answer in time", async () => {
    const { fetch } = fakeFetch({ ...healthy, "/repos/zxxdev/TrailMate/languages": "hang" });
    await expect(
      fetchGitHubSnapshot(["zxxdev/TrailMate"], { fetch, now, timeoutMs: 20 }),
    ).rejects.toThrow(/languages: no answer/);
  });

  it("fails for a project whose repository is not public on the account", async () => {
    const { fetch } = fakeFetch(healthy);
    await expect(fetchGitHubSnapshot(["zxxdev/private-thing"], { fetch, now })).rejects.toThrow(
      GitHubError,
    );
  });

  it("reads every page of the repository list, not just the first 100", async () => {
    const filler = Array.from({ length: 100 }, (_, index) => ({
      name: `repo-${String(index)}`,
      full_name: `zxxdev/repo-${String(index)}`,
      pushed_at: "2026-11-01T00:00:00Z",
      stargazers_count: 0,
      fork: false,
      // Archived, so the site does not list them and asks nothing more about them.
      archived: true,
    }));
    const { fetch, calls } = fakeFetch({
      ...healthy,
      "/users/zxxdev/repos?type=owner&per_page=100&page=1": { status: 200, body: filler },
      "/users/zxxdev/repos?type=owner&per_page=100&page=2": { status: 200, body: repositoryList },
    });
    const result = await fetchGitHubSnapshot(["zxxdev/TrailMate"], { fetch, now });
    expect(result.repositories).toHaveLength(102);
    expect(result.stats["zxxdev/trailmate"]?.stars).toBe(3);
    expect(calls.filter((call) => call.url.includes("/users/"))).toHaveLength(2);
  });

  it("refuses a release link that does not point to github.com", async () => {
    const { fetch } = fakeFetch({
      ...healthy,
      "/repos/zxxdev/TrailMate/releases/latest": {
        status: 200,
        body: { tag_name: "v1", html_url: "javascript:alert(1)", published_at: null },
      },
    });
    await expect(fetchGitHubSnapshot(["zxxdev/TrailMate"], { fetch, now })).rejects.toThrow(
      /releases\/latest: unexpected answer at html_url/,
    );
  });
});

describe("the README's picture", () => {
  const readmeUrl = "https://raw.githubusercontent.com/zxxdev/DispelGlow/main/README.md";

  it("skips badges and other outside images", () => {
    const readme = [
      "[![CI](https://img.shields.io/badge/ci-green.svg)](x)",
      "![Remote](https://example.com/a.png)",
      "![Drawing](docs/diagram.svg)",
      "![Shot](./docs/images/glow.png)",
    ].join("\n");
    expect(firstReadmePicture(readme)).toEqual({ src: "./docs/images/glow.png", alt: "Shot" });
  });

  it("reads an <img> with its attributes in any order", () => {
    expect(firstReadmePicture("<img width='340' alt='Glow' src='docs/g.webp'>")).toEqual({
      src: "docs/g.webp",
      alt: "Glow",
    });
  });

  it("keeps an apostrophe inside the alternative text", () => {
    expect(firstReadmePicture(`<img src="a.png" alt="The addon's own images">`)?.alt).toBe(
      "The addon's own images",
    );
  });

  it("finds none when there is none", () => {
    expect(firstReadmePicture("# Just text")).toBeNull();
  });

  it("builds the raw address from the README's, for relative and root paths", () => {
    expect(readmePictureUrl(readmeUrl, "docs/images/glow.png")).toBe(
      "https://raw.githubusercontent.com/zxxdev/DispelGlow/main/docs/images/glow.png",
    );
    expect(readmePictureUrl(readmeUrl, "/docs/a.png?raw=true")).toBe(
      "https://raw.githubusercontent.com/zxxdev/DispelGlow/main/docs/a.png",
    );
  });

  it("refuses a path that leaves the repository", () => {
    expect(readmePictureUrl(readmeUrl, "../../other/main/x.png")).toBeNull();
  });
});

describe("loadGitHubData", () => {
  it("falls back on any failure, even one that is not a GitHub error", async () => {
    const { fetch } = fakeFetch(healthy);
    const warnings: string[] = [];
    const broken = () => {
      throw new TypeError("clock broke");
    };
    const result = await loadGitHubData(["zxxdev/TrailMate"], {
      fetch,
      now: broken,
      snapshot: saved,
      warn: (message) => warnings.push(message),
    });
    expect(result.source).toBe("snapshot");
    expect(warnings[0]).toMatch(/unexpected TypeError: TypeError: clock broke/);
  });

  it("warns when the saved copy has nothing for a project", async () => {
    const warnings: string[] = [];
    await loadGitHubData(["zxxdev/TrailMate", "zxxdev/new-project"], {
      snapshot: saved,
      offline: true,
      warn: (message) => warnings.push(message),
    });
    expect(warnings).toEqual([
      "GitHub data: the saved copy has nothing for zxxdev/new-project; run pnpm github:snapshot.",
    ]);
  });

  it("uses live data when GitHub answers", async () => {
    const { fetch } = fakeFetch(healthy);
    const result = await loadGitHubData(["zxxdev/TrailMate"], { fetch, now, snapshot: saved });
    expect(result.source).toBe("live");
    expect(result.stats["zxxdev/trailmate"]?.stars).toBe(3);
  });

  it("falls back to the whole saved copy, and says so, when GitHub fails", async () => {
    const { fetch } = fakeFetch({
      ...healthy,
      "/repos/zxxdev/TrailMate/languages": { status: 502 },
    });
    const warnings: string[] = [];
    const result = await loadGitHubData(["zxxdev/TrailMate"], {
      fetch,
      now,
      snapshot: saved,
      warn: (message) => warnings.push(message),
    });
    expect(result).toEqual({ ...saved, source: "snapshot" });
    expect(warnings).toEqual([
      "GitHub data: GET /repos/zxxdev/TrailMate/languages: HTTP 502. Using the saved copy from 2026-11-10T08:00:00.000Z.",
    ]);
  });

  it("does not call GitHub when told to stay offline", async () => {
    const { fetch, calls } = fakeFetch(healthy);
    const result = await loadGitHubData(["zxxdev/TrailMate"], {
      fetch,
      snapshot: saved,
      offline: true,
    });
    expect(result.source).toBe("snapshot");
    expect(calls).toEqual([]);
  });

  it("refuses a broken saved copy: there would be nothing true to show", async () => {
    const { fetch } = fakeFetch(healthy);
    await expect(
      loadGitHubData([], { fetch, snapshot: { ...saved, fetchedAt: "yesterday" } }),
    ).rejects.toThrow(/github-snapshot\.json/);
  });
});

describe("languageShares", () => {
  it("turns byte counts into shares, largest first", () => {
    expect(languageShares({ Go: 250, Lua: 750 })).toEqual([
      { name: "Lua", share: 0.75 },
      { name: "Go", share: 0.25 },
    ]);
  });

  it("adds up languages under 2% into Other", () => {
    const shares = languageShares({ Lua: 970, Shell: 10, Makefile: 10, Go: 10 });
    expect(shares.map((language) => language.name)).toEqual(["Lua", "Other"]);
    // Three times 0.01 is not exactly 0.03 in floating point: compare closely, not exactly.
    expect(shares[1]?.share).toBeCloseTo(0.03, 10);
  });

  it("returns nothing for a repository with no code", () => {
    expect(languageShares({})).toEqual([]);
  });
});

describe("format", () => {
  it("writes dates as day, short month and year, in UTC", () => {
    expect(formatDate("2026-11-18T23:30:00Z")).toBe("18 Nov 2026");
    expect(isoDate("2026-11-18T23:30:00Z")).toBe("2026-11-18");
  });

  it("writes shares with one decimal, never a nonzero share as 0.0%", () => {
    expect(formatShare(0.7843)).toBe("78.4%");
    expect(formatShare(1)).toBe("100.0%");
    expect(formatShare(0.0004)).toBe("<0.1%");
  });
});
