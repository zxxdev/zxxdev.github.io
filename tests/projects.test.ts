import { describe, expect, it } from "vitest";
import { isInSection, projectPath } from "../src/data/navigation";
import { technologySlug, type Technology } from "../src/data/technologies";
import {
  filterTechnologies,
  sortProjects,
  statusLabel,
  technologiesInUse,
} from "../src/lib/projects";

describe("statusLabel", () => {
  it("says Live for a live project", () => {
    expect(statusLabel({ kind: "live" })).toBe("Live");
  });

  it("turns a pre-release tag into a word before the version", () => {
    expect(statusLabel({ kind: "early", version: "0.1.0-alpha" })).toBe("Alpha · 0.1.0");
  });

  it("shows a plain version with a v", () => {
    expect(statusLabel({ kind: "early", version: "0.3.0" })).toBe("v0.3.0");
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
      { title: "Languages", items: ["TypeScript", "Lua"] },
      { title: "Web", items: ["Astro"] },
      { title: "Testing and code quality", items: ["Vitest", "busted"] },
      { title: "CI and supply chain", items: ["GitHub Actions"] },
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

describe("project addresses", () => {
  it("puts a project's page under /projects/", () => {
    expect(projectPath("trailmate")).toBe("/projects/trailmate/");
  });

  it("marks Projects as the section of a project's page, but not Home", () => {
    expect(isInSection("/projects/", "/projects/trailmate/")).toBe(true);
    expect(isInSection("/projects/", "/about/")).toBe(false);
    expect(isInSection("/", "/projects/trailmate/")).toBe(false);
  });
});
