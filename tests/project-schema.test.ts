/**
 * The project schema: what a project file must contain. Astro runs this same
 * schema on every file in src/content/projects/ while building, so each case
 * that fails here is a build that stops with an error instead of a broken page.
 */
import type { SchemaContext } from "astro:content";
import { z } from "astro/zod";
import { describe, expect, it } from "vitest";
import { projectSchema } from "../src/lib/project-schema";

// Outside Astro there is no image pipeline: a screenshot path is just text here.
const schema = projectSchema({ image: () => z.string() } as unknown as SchemaContext);

/** A project that meets the schema. Each test changes one thing in it. */
const valid = {
  title: "Example",
  repo: "zxxdev/example",
  summary: "An example project used by the tests.",
  tone: "cobalt",
  status: { kind: "early", version: "0.1.0-alpha" },
  stack: ["TypeScript", "Vitest"],
  tooling: ["GitHub Actions"],
  cover: { kind: "generated", caption: "example", art: "browser" },
  featured: false,
  order: 3,
};

/** The paths of the fields that failed, such as "status.version". */
function failedFields(input: unknown): string[] {
  const result = schema.safeParse(input);
  if (result.success) return [];
  return result.error.issues.map((issue) => issue.path.join("."));
}

describe("project schema", () => {
  it("accepts a complete project", () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it("fills in the optional fields: no tooling and not featured", () => {
    const { tooling: _tooling, featured: _featured, ...minimal } = valid;
    const result = schema.parse(minimal);
    expect(result.tooling).toEqual([]);
    expect(result.featured).toBe(false);
  });

  it("accepts a screenshot cover with its alternative text", () => {
    const withScreenshot = {
      ...valid,
      cover: { kind: "screenshot", image: "./cover.png", alt: "The home page." },
    };
    expect(schema.safeParse(withScreenshot).success).toBe(true);
  });

  it("rejects a missing required field", () => {
    const { summary: _summary, ...withoutSummary } = valid;
    expect(failedFields(withoutSummary)).toContain("summary");
  });

  it("rejects a misspelt field instead of ignoring it", () => {
    expect(failedFields({ ...valid, sumary: "typo" })).not.toEqual([]);
  });

  it("rejects a tone outside the closed list", () => {
    expect(failedFields({ ...valid, tone: "pink" })).toContain("tone");
  });

  it("rejects a technology the site does not know", () => {
    expect(failedFields({ ...valid, stack: ["TypeScript", "Typescript"] })).toContain("stack.1");
  });

  it("rejects an empty stack", () => {
    expect(failedFields({ ...valid, stack: [] })).toContain("stack");
  });

  it("rejects a technology listed twice", () => {
    expect(failedFields({ ...valid, tooling: ["Vitest"] })).not.toEqual([]);
  });

  it("rejects an early project without a version", () => {
    expect(failedFields({ ...valid, status: { kind: "early" } })).toContain("status.version");
  });

  it("rejects a version that is not a semantic version", () => {
    const status = { kind: "early", version: "alpha" };
    expect(failedFields({ ...valid, status })).toContain("status.version");
  });

  it("rejects a summary longer than 140 characters", () => {
    expect(failedFields({ ...valid, summary: "x".repeat(141) })).toContain("summary");
  });

  it("rejects a repository that is not owner/name", () => {
    expect(failedFields({ ...valid, repo: "https://github.com/zxxdev/example" })).toContain(
      "repo",
    );
  });

  it("rejects a screenshot without alternative text", () => {
    const cover = { kind: "screenshot", image: "./cover.png" };
    expect(failedFields({ ...valid, cover })).toContain("cover.alt");
  });
});
