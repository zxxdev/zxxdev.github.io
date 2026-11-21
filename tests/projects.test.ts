import { describe, expect, it } from "vitest";
import { technologySlug, type Technology } from "../src/data/technologies";
import {
  applyTranslation,
  filterTechnologies,
  sortProjects,
  statusLabel,
  technologiesInUse,
} from "../src/lib/projects";
import type { Project } from "../src/lib/project-schema";

describe("statusLabel", () => {
  it("says Live for a live project, in the page's language", () => {
    expect(statusLabel({ kind: "live" }, "en")).toBe("Live");
    expect(statusLabel({ kind: "live" }, "es")).toBe("Publicado");
  });

  it("says In development without a version, in the page's language", () => {
    expect(statusLabel({ kind: "development" }, "en")).toBe("In development");
    expect(statusLabel({ kind: "development" }, "es")).toBe("En desarrollo");
  });

  it("turns a pre-release tag into a word before the version, the same in every language", () => {
    expect(statusLabel({ kind: "early", version: "0.1.0-alpha" }, "en")).toBe("Alpha · 0.1.0");
    expect(statusLabel({ kind: "early", version: "0.1.0-alpha" }, "es")).toBe("Alpha · 0.1.0");
  });

  it("shows a plain version with a v", () => {
    expect(statusLabel({ kind: "early", version: "0.3.0" }, "en")).toBe("v0.3.0");
  });
});

describe("applyTranslation", () => {
  const base: Project = {
    title: "Portfolio site",
    repo: "zxxdev/zxxdev.github.io",
    summary: "This site.",
    tone: "violet",
    status: { kind: "live" },
    stack: ["Astro"],
    tooling: [],
    cover: { kind: "generated", caption: "github pages", art: "browser" },
    featured: true,
    order: 1,
  };

  it("takes the words from the translation and everything else from the project file", () => {
    const translated = applyTranslation(base, {
      title: "Web personal",
      summary: "Esta web.",
      cover: "github pages en español",
    });
    expect(translated).toEqual({
      ...base,
      title: "Web personal",
      summary: "Esta web.",
      cover: { kind: "generated", caption: "github pages en español", art: "browser" },
    });
  });

  it("keeps the English title when the translation has none", () => {
    expect(applyTranslation(base, { summary: "Esta web.", cover: "x" }).title).toBe(
      "Portfolio site",
    );
  });

  it("puts the cover text in the alternative text of a picture", () => {
    const withPicture: Project = {
      ...base,
      cover: { kind: "repository", url: "https://raw.githubusercontent.com/a/b/c.png", alt: "A" },
    };
    expect(applyTranslation(withPicture, { summary: "S", cover: "Una imagen" }).cover).toEqual({
      kind: "repository",
      url: "https://raw.githubusercontent.com/a/b/c.png",
      alt: "Una imagen",
    });
  });
});

describe("sortProjects", () => {
  const entry = (title: string, order: number) => ({ data: { title, order } });

  it("orders by `order`, then by title when two share it", () => {
    const sorted = sortProjects([entry("B", 2), entry("C", 1), entry("A", 2)]);
    expect(sorted.map((project) => project.data.title)).toEqual(["C", "A", "B"]);
  });

  it("does not change the list it was given", () => {
    const projects = [entry("B", 2), entry("A", 1)];
    sortProjects(projects);
    expect(projects.map((project) => project.data.title)).toEqual(["B", "A"]);
  });
});

describe("technologies built from the projects", () => {
  const projects: { stack: Technology[]; tooling: Technology[] }[] = [
    { stack: ["Lua", "busted"], tooling: ["GitHub Actions"] },
    { stack: ["TypeScript", "Astro"], tooling: ["Vitest"] },
  ];

  it("lists only what some project uses, in catalog order, without empty groups", () => {
    expect(technologiesInUse(projects)).toEqual([
      { id: "languages", items: ["TypeScript", "Lua"] },
      { id: "web", items: ["Astro"] },
      { id: "quality", items: ["Vitest", "busted"] },
      { id: "ci", items: ["GitHub Actions"] },
    ]);
  });

  it("offers in the filter the languages and frameworks of some stack, not shared tooling", () => {
    // busted is in a stack, but test runners are not filter groups; Vitest is only tooling.
    expect(filterTechnologies(projects)).toEqual(["TypeScript", "Lua", "Astro"]);
  });
});

describe("technologySlug", () => {
  it("makes a name safe for an address", () => {
    expect(technologySlug("Tailwind CSS")).toBe("tailwind-css");
    expect(technologySlug("GitHub Actions")).toBe("github-actions");
    expect(technologySlug("pnpm")).toBe("pnpm");
  });
});
