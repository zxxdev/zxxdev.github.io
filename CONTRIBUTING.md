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
pnpm build         # builds the static site into dist/
```

## Adding a dependency

Fewer dependencies is better: if something takes a few lines, write it. If a new package is really
needed, the pull request must say:

- that it is the official package (linked repository, maintainers, documentation that recommends it);
- that the version is at least 7 days old (pnpm enforces this, see `pnpm-workspace.yaml`);
- whether it needs an install script, and why. Install scripts are blocked unless listed in
  `allowBuilds`.
