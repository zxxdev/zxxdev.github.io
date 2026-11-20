# 0004. Keep each project in a Markdown file checked by a schema

- **Status:** accepted
- **Date:** 2026-11-20

## Context

Until now the projects lived in a TypeScript array in `src/data/profile.ts`. That was enough for two
cards, but the site needs a page per project with real text (what it solves, how it works, the
decisions), and adding a project should not mean editing code. At the same time, a mistake in a
project's data (a missing field, a misspelt technology, a status with no version) must never reach
the live site as a half-empty card.

The technologies list on the home page was also typed by hand, separately from the projects, so it
could drift from what the repositories actually use.

## Options

1. **Keep the TypeScript array** and add a long text field per project. Type-checked, but writing
   several paragraphs inside a code file is awkward, and every new project is a code change.
2. **Markdown files with no checks.** Easy to write, but a typo in a field name is silently ignored
   and the page is built with a gap.
3. **A content collection:** one Markdown file per project, its front matter checked against a
   schema while building. Astro supports this natively, with Zod for the schema.
4. **A headless CMS.** A web editor, but an external service with an account, a token in CI and one
   more thing that can fail, for a site with one author.

## Decision

Option 3.

- Each project is `src/content/projects/<id>.md`. The file name is the project's id and its address,
  `/projects/<id>/`; project pages are never at the top level, where they could clash with the Pages
  site GitHub serves for each repository (`zxxdev.github.io/<repo>/`). A unit test checks this.
- The schema (`src/lib/project-schema.ts`) uses strict objects, so an unknown field is an error, not
  ignored. Tones and technologies are closed lists. An early project must carry its version, and a
  screenshot must carry its alternative text.
- Technologies come from one catalog, `src/data/technologies.ts`, grouped as they appear on screen.
  The home page lists only the ones some project uses.
- The schema lives outside `src/content.config.ts` so Vitest can check it without starting Astro.

## Consequences

- Adding a project is adding one file; a broken file stops the build and names the file and the
  field.
- The front matter is YAML, which has its own traps (an unquoted `:` in a summary changes its
  meaning). Summaries that contain a colon are quoted.
- A new technology must be added to the catalog before a project can use it. That is one more step,
  on purpose: it keeps names consistent ("TypeScript", never "Typescript").
- The route test only knows the repositories that have a project file, plus the profile repository.
  Once the site reads the account's repositories from the GitHub API, the test should use that list.
- If the site ever needed several people editing content without Git, a CMS would be worth
  revisiting.
