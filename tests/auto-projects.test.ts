/**
 * How a repository becomes a project when it has no project file. Plain data
 * in, plain data out: no Astro, no network.
 */
import { describe, expect, it } from "vitest";
import {
  autoProjects,
  captionOf,
  projectId,
  stackOf,
  statusOf,
  summaryOf,
  SUMMARY_LENGTH,
  toneOf,
} from "../src/lib/auto-projects";
import { isListedAutomatically, type RepositoryStats } from "../src/lib/github";

function repository(fullName: string, overrides: Partial<RepositoryStats> = {}): RepositoryStats {
  return {
    fullName,
    description: "A repository.",
    topics: [],
    pushedAt: "2026-11-20T10:00:00Z",
    stars: 0,
    languages: [],
    latestRelease: null,
    image: null,
    ...overrides,
  };
}

describe("projectId", () => {
  it("splits CamelCase names into words for the address", () => {
    expect(projectId("RetailArenaCountdown")).toBe("retail-arena-countdown");
    expect(projectId("DispelGlow")).toBe("dispel-glow");
  });

  it("keeps acronyms together and drops dots", () => {
    expect(projectId("MCPServer")).toBe("mcp-server");
    expect(projectId("zxxdev.github.io")).toBe("zxxdev-github-io");
  });
});

describe("which repositories are listed on their own", () => {
  it("leaves out forks, archived repositories and the profile repository", () => {
    expect(isListedAutomatically({ name: "DispelGlow", fork: false, archived: false })).toBe(true);
    expect(isListedAutomatically({ name: "a-fork", fork: true, archived: false })).toBe(false);
    expect(isListedAutomatically({ name: "old", fork: false, archived: true })).toBe(false);
    expect(isListedAutomatically({ name: "ZXXDEV", fork: false, archived: false })).toBe(false);
  });
});

describe("stackOf", () => {
  it("names the languages with a real share, then the topics the site knows", () => {
    const stats = repository("zxxdev/x", {
      languages: [
        { name: "Lua", share: 0.92 },
        { name: "Go", share: 0.05 },
        { name: "Other", share: 0.03 },
      ],
      topics: ["lua", "github-actions", "world-of-warcraft"],
    });
    expect(stackOf(stats)).toEqual(["Lua", "GitHub Actions"]);
  });

  it("is empty when nothing matches a known technology", () => {
    expect(stackOf(repository("zxxdev/x", { topics: ["pvp"] }))).toEqual([]);
  });
});

describe("toneOf", () => {
  it("takes the tone of the first topic that has one", () => {
    expect(toneOf(["addon", "world-of-warcraft", "website"])).toBe("amber");
    expect(toneOf(["website"])).toBe("violet");
  });

  it("falls back to cobalt", () => {
    expect(toneOf(["something"])).toBe("cobalt");
  });

  it("is not fooled by topics named like Object's own methods", () => {
    expect(toneOf(["constructor", "tostring"])).toBe("cobalt");
    expect(captionOf(["constructor", "pvp"])).toBe("constructor · pvp");
  });
});

describe("statusOf", () => {
  const release = (tag: string) => ({ tag, url: "https://github.com/zxxdev/x", publishedAt: null });

  it("shows the latest release's version", () => {
    expect(statusOf(release("v1.0.0"))).toEqual({ kind: "early", version: "1.0.0" });
    expect(statusOf(release("0.2.0-beta"))).toEqual({ kind: "early", version: "0.2.0-beta" });
  });

  it("says in development without a release, or with a tag that is not a version", () => {
    expect(statusOf(null)).toEqual({ kind: "development" });
    expect(statusOf(release("nightly"))).toEqual({ kind: "development" });
  });
});

describe("summaryOf", () => {
  it("keeps a short description as it is", () => {
    expect(summaryOf("Short.")).toBe("Short.");
  });

  it("keeps the first sentence of a long one when it fits", () => {
    const text = `Glows on enemy buffs you can dispel. ${"More detail. ".repeat(12)}`;
    expect(summaryOf(text)).toBe("Glows on enemy buffs you can dispel.");
  });

  it("cuts a long one at a word, with an ellipsis, within the card's limit", () => {
    const long = `${"word ".repeat(40)}end`;
    const summary = summaryOf(long);
    expect(summary.length).toBeLessThanOrEqual(SUMMARY_LENGTH);
    expect(summary.endsWith("word…")).toBe(true);
  });

  it("says so when there is no description", () => {
    expect(summaryOf(null)).toBe("No description on GitHub yet.");
    expect(summaryOf("   ")).toBe("No description on GitHub yet.");
  });
});

describe("captionOf", () => {
  it("says where the project runs, then what it is, whatever order GitHub gives", () => {
    expect(
      captionOf(["addon", "arena", "lua", "world-of-warcraft", "wow-3-3-5a", "wow-addon"]),
    ).toBe("wow 3.3.5a · addon");
  });

  it("otherwise uses two topics that are not technologies or tones", () => {
    expect(captionOf(["arena", "lua", "pvp", "world-of-warcraft"])).toBe("arena · pvp");
  });

  it("has a fallback", () => {
    expect(captionOf(["lua"])).toBe("on github");
  });
});

describe("autoProjects", () => {
  const stats = {
    "zxxdev/trailmate": repository("zxxdev/TrailMate"),
    "zxxdev/dispelglow": repository("zxxdev/DispelGlow", {
      pushedAt: "2026-11-21T01:00:00Z",
      topics: ["world-of-warcraft", "lua"],
      languages: [{ name: "Lua", share: 1 }],
      latestRelease: {
        tag: "v1.0.0",
        url: "https://github.com/zxxdev/DispelGlow",
        publishedAt: null,
      },
    }),
    "zxxdev/older": repository("zxxdev/Older", { pushedAt: "2026-11-01T00:00:00Z" }),
  };

  it("makes a project of every repository without a project file, newest push first", () => {
    const projects = autoProjects(stats, ["zxxdev/TrailMate"], ["trailmate"]);
    expect(projects.map((project) => project.id)).toEqual(["dispel-glow", "older"]);
    const [glow] = projects;
    expect(glow?.data).toMatchObject({
      title: "DispelGlow",
      repo: "zxxdev/DispelGlow",
      tone: "amber",
      status: { kind: "early", version: "1.0.0" },
      stack: ["Lua"],
      featured: false,
    });
  });

  it("uses the README's picture as the cover when there is one", () => {
    const image = {
      url: "https://raw.githubusercontent.com/zxxdev/Older/main/docs/shot.png",
      alt: "A shot.",
    };
    const [older] = autoProjects({ "zxxdev/older": repository("zxxdev/Older", { image }) }, [], []);
    expect(older?.data.cover).toEqual({ kind: "repository", ...image });
  });

  it("puts them after every project file", () => {
    const projects = autoProjects(stats, [], []);
    expect(Math.min(...projects.map((project) => project.data.order))).toBeGreaterThanOrEqual(1000);
  });

  it("never reuses the address of a project file, and says which repository it left out", () => {
    const warnings: string[] = [];
    const projects = autoProjects(stats, [], ["dispel-glow"], (message) => warnings.push(message));
    expect(projects.map((project) => project.id)).not.toContain("dispel-glow");
    expect(warnings).toEqual([
      "Projects: zxxdev/DispelGlow is not listed, its address /projects/dispel-glow/ is already taken.",
    ]);
  });
});
