/**
 * Content collections. Each project is one Markdown file in
 * src/content/projects/: the front matter holds the data and the body is the
 * text of the project's page. The file name is its id and its address:
 * trailmate.md becomes /projects/trailmate/.
 */
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { projectSchema } from "./lib/project-schema";

const projects = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/projects" }),
  schema: projectSchema,
});

export const collections = { projects };
