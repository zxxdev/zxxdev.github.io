# 0001. Use Astro to build the site as static pages

- **Status:** accepted
- **Date:** 2026-11-17

## Context

The site presents me and my projects. It is mostly text and images that change when a project
changes, not on every visit. It has to be fast, cheap to host, easy to keep secure, and every part
of it has to be something I can explain. A few pieces need some code in the browser later (the
light/dark switch and the search box).

Hosting is GitHub Pages, which only serves files: it cannot run a server.

## Options

1. **Astro.** A framework for content sites that builds plain HTML at build time and sends no
   JavaScript to the browser unless a component asks for it ("islands"). Supports TypeScript,
   Markdown content with validated schemas, and Tailwind CSS.
2. **Next.js with static export.** Very popular and flexible, but designed for interactive
   applications with a server. A static export still ships the React runtime to every page, and
   several features (image optimisation, server components with data fetching on request) do not
   apply without a server.
3. **Hugo.** A very fast static site generator, but templates use Go's template language, and the
   site would need a separate JavaScript toolchain anyway for the interactive pieces and the tests.

## Decision

Use **Astro** with strict TypeScript, Tailwind CSS and static output, deployed to GitHub Pages by
GitHub Actions.

## Consequences

- Pages are plain HTML and CSS: fast to load, nothing to patch on a server, free hosting.
- Content lives in Markdown files with a schema, so a missing field fails the build instead of
  showing a broken page.
- Nothing changes on the site without a new build. Data from GitHub (stars, last update) will be
  fetched at build time and refreshed by a scheduled rebuild, so it can be a few days old.
- Astro moves fast: major versions arrive often. Dependabot proposes upgrades and CI must stay
  green before they are merged.
- Astro's own type checker (`astro check`) depends on native and WebAssembly packages. In this
  repository one of them had to be pinned to its stable line (see `pnpm-workspace.yaml`); this is
  the kind of tooling issue to expect when upgrading.
