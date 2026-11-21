---
title: Portfolio site
repo: zxxdev/zxxdev.github.io
summary: "This site: a static portfolio with a design built on tokens, light and dark theme, and CI that checks every change before it is published."
tone: violet
status:
  kind: live
stack: [Astro, TypeScript, Tailwind CSS, GitHub Actions]
tooling: [Vitest, Playwright, ESLint, Prettier, CodeQL, Dependabot, pnpm]
cover:
  kind: screenshot
  # Made by scripts/screenshots.ts, never by hand: rerun it when the design changes.
  image: ../../assets/projects/zxxdev-github-io.png
  alt: The home page of this site in dark theme, with the headline and a short introduction.
featured: true
order: 1
---

## The problem

I wanted one place that shows what I build and the real state of each project. It had to cost
nothing to host, leave nothing to patch and read well on a phone.

## How it works

- Every page is built once, when the site is compiled, and published as plain files on GitHub
  Pages. There is no server and no database behind it.
- Each project is a Markdown file checked against a schema. If a file misses a field or names a
  technology the site does not know, the build stops and says which file and which field.
- The site is in English and Spanish, each language at its own addresses. Each language's words are
  kept in one place, and a test fails if a page or a project is missing in either.
- The technologies on the home page are collected from the projects, so nothing is listed that no
  project uses.
- The filter on the Projects page is a small script. Without JavaScript the whole list still shows.
- The dates, stars, releases and languages on these pages come from the GitHub API while the site
  is built, never from the visitor's browser. If GitHub does not answer, the build uses a saved
  copy, still publishes, and says so under the figures.
- Every change goes through a pull request with lint, type checks, unit tests, a dependency audit
  and a full build before it can be merged.

## Decisions

- [Astro for a static site](https://github.com/zxxdev/zxxdev.github.io/blob/main/docs/adr/0001-use-astro-for-a-static-site.md):
  a content site needs HTML, not a running server.
- [Design tokens and theme](https://github.com/zxxdev/zxxdev.github.io/blob/main/docs/adr/0002-design-tokens-and-theme.md):
  every colour is defined once, with its light and dark value side by side.
- [Sharp redesign and project tones](https://github.com/zxxdev/zxxdev.github.io/blob/main/docs/adr/0003-sharp-redesign-and-project-tones.md):
  one colour per kind of project, from a closed list of four.
- [Projects as a content collection](https://github.com/zxxdev/zxxdev.github.io/blob/main/docs/adr/0004-projects-as-a-content-collection.md):
  one Markdown file per project, with a schema the build enforces.
- [GitHub data at build time](https://github.com/zxxdev/zxxdev.github.io/blob/main/docs/adr/0005-github-data-at-build-time.md):
  no rate limit or token in the browser, and a GitHub outage never stops a deployment.
- [Spanish and English](https://github.com/zxxdev/zxxdev.github.io/blob/main/docs/adr/0007-spanish-and-english.md):
  English keeps its addresses and Spanish lives under `/es/`.

## Not done yet

End-to-end and accessibility tests, and search. They are listed in order in the
[roadmap](https://github.com/zxxdev/zxxdev.github.io#limitations-and-roadmap).
