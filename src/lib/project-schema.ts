/**
 * The schema every project file must meet. Astro checks each Markdown file in
 * src/content/projects/ against it while building: a missing field, a typo in a
 * field name, an unknown tone or technology, or a value of the wrong kind stops
 * the build with the file and the field that failed.
 *
 * It lives apart from src/content.config.ts so the unit tests can check it
 * without starting Astro.
 */
import type { SchemaContext } from "astro:content";
import { z } from "astro/zod";
import { technologyNames } from "../data/technologies";
import { tones } from "../data/tones";
import { RAW_ORIGIN } from "./github";

/** A semantic version, optionally with a pre-release tag: 0.3.0, 0.1.0-alpha. */
const version = z
  .string()
  .regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?$/, "Expected a version like 0.1.0 or 0.1.0-alpha");

/**
 * Where a project stands.
 * - live: published and in use as it is.
 * - early: an alpha or a first version, with the version exactly as the
 *   project declares it. The label on screen is built from it, never typed.
 * - development: no version published yet.
 */
const status = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("live") }),
  z.strictObject({ kind: z.literal("early"), version }),
  z.strictObject({ kind: z.literal("development") }),
]);

/** True for a version the status can hold: 0.1.0, 1.0.0, 0.1.0-alpha. */
export function isVersion(value: string): boolean {
  return version.safeParse(value).success;
}

/** The drawing on a generated cover. */
export const coverArts = ["browser", "arrow"] as const;

const technology = z.enum(technologyNames);

export function projectSchema({ image }: SchemaContext) {
  /**
   * A real screenshot, which needs its alternative text, or a cover generated
   * from the project's tone until there is one.
   */
  const cover = z.discriminatedUnion("kind", [
    z.strictObject({
      kind: z.literal("generated"),
      caption: z.string().min(1),
      art: z.enum(coverArts),
    }),
    z.strictObject({
      kind: z.literal("screenshot"),
      image: image(),
      alt: z.string().min(1),
    }),
    /** A picture the repository's README shows, served by GitHub (projects made from GitHub). */
    z.strictObject({
      kind: z.literal("repository"),
      url: z
        .url()
        .refine((url) => url.startsWith(`${RAW_ORIGIN}/`), { message: "Expected a raw file link" }),
      alt: z.string().min(1),
    }),
  ]);

  return z
    .strictObject({
      title: z.string().min(1),
      /** owner/name on GitHub. The repository link is built from it. */
      repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/, "Expected owner/name"),
      /** Shown on the card: short enough not to be cut. */
      summary: z.string().min(1).max(140),
      tone: z.enum(tones),
      status,
      /** The main technologies: shown on the card and used by the filter. */
      stack: z.array(technology).min(1).max(5),
      /** Everything else the repository uses: shown on the project's page. */
      tooling: z.array(technology).default([]),
      cover,
      /** Shown on the home page as well. */
      featured: z.boolean().default(false),
      /** Position in every list: lowest first. */
      order: z.number().int().nonnegative(),
      demo: z.url().optional(),
    })
    .refine(
      (project) =>
        new Set([...project.stack, ...project.tooling]).size ===
        project.stack.length + project.tooling.length,
      {
        message: "A technology is listed twice (in stack, in tooling or in both)",
        // Named on tooling, where a repeated name usually belongs. This check
        // only runs once every other field is valid.
        path: ["tooling"],
      },
    );
}

/** A project's data once the schema has checked it. */
export type Project = z.output<ReturnType<typeof projectSchema>>;
export type ProjectStatus = Project["status"];
export type CoverArt = (typeof coverArts)[number];
