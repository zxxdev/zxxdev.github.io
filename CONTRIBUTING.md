# Contributing

This is a personal site, so most changes come from me. Bug reports and suggestions are very
welcome: please [open an issue](https://github.com/zxxdev/zxxdev.github.io/issues/new/choose).
For security problems, follow [SECURITY.md](SECURITY.md) instead.

## How changes are made

Every change follows the same path, including my own:

1. An issue describes the change and its acceptance criteria.
2. Work happens on a branch named `<type>/<issue>-<summary>`, for example `feat/12-dark-mode`.
3. Commits follow [Conventional Commits](https://www.conventionalcommits.org/):
   `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `build`, `ci`, `chore`.
4. A pull request closes the issue. CI must be green before it is merged.
5. Pull requests are squash-merged, so `main` keeps one commit per change.
6. Merging to `main` deploys the site automatically.

## Running the checks

Requirements: Node.js 26 and pnpm 12 (the exact version is in `package.json`).

```sh
pnpm install --frozen-lockfile
pnpm lint          # ESLint
pnpm format:check  # Prettier
pnpm check         # astro check: TypeScript and Astro diagnostics
pnpm test          # Vitest: unit tests
pnpm build         # builds the static site into dist/
```

## Adding a project

Add one Markdown file to `src/content/projects/`. The file name becomes the project's address
(`trailmate.md` is `/projects/trailmate/`). Copy the front matter of an existing file and change it;
the body is the text of the project's page, usually "The problem", "How it works" and "Decisions".

The schema in `src/lib/project-schema.ts` checks every file while building. If the build stops, the
message names the file and the field. A technology must be in `src/data/technologies.ts` before a
project can use it.

Every project file needs its Spanish version, with the same name, in `src/content/projects/es/`
(`trailmate.md` is also `/es/proyectos/trailmate/`). It holds only the words: `summary`, `cover`
(the picture's alternative text, or the generated cover's caption) and, if the name changes,
`title`. Its body is the page's text in Spanish. The rest comes from the English file. The build
and the unit tests fail if one of the two is missing.

## Adding a page or interface text

Every page exists in English and Spanish. Write its markup once in `src/views/`, add its path in
each language to `src/i18n/routes.ts`, and add one small file per language in `src/pages/` that
renders the view with its language. Words go in `src/i18n/ui.ts`, never in the markup; the Spanish
dictionary must have the same entries as the English one, or the type check fails. A unit test
fails if a page exists in one language only.

## Adding a dependency

Fewer dependencies is better: if something takes a few lines, write it. If a new package is really
needed, the pull request must say:

- that it is the official package (linked repository, maintainers, documentation that recommends it);
- that the version is at least 7 days old (pnpm enforces this, see `pnpm-workspace.yaml`);
- whether it needs an install script, and why. Install scripts are blocked unless listed in
  `allowBuilds`.
