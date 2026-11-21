/**
 * Content collections. Each project is one Markdown file in
 * src/content/projects/: the front matter holds the data and the body is the
 * text of the project's page. The file name is its id and its address:
 * trailmate.md becomes /projects/trailmate/ and /es/proyectos/trailmate/.
 *
 * Its Spanish version has the same name in src/content/projects/es/ and holds
 * only the words (projectTranslationSchema). The pattern "*.md" does not look
 * into subfolders, so the Spanish files are never read as projects.
 */
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { projectSchema, projectTranslationSchema } from "./lib/project-schema";

const projects = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/projects" }),
  schema: projectSchema,
});

const projectsEs = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/projects/es" }),
  schema: projectTranslationSchema,
});

export const collections = { projects, projectsEs };
