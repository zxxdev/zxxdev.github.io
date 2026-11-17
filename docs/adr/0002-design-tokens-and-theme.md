# 0002. Define the design as named tokens, with a light and a dark theme

- **Status:** accepted
- **Date:** 2026-11-17

## Context

The site needs a visual identity that works for two kinds of visitor: a recruiter who opens the
link from a CV, and an engineer who wants to see how things are built. It has to be readable in
light and dark mode, accessible (WCAG AA contrast), fast to load, and easy to change later without
touching every page.

The chosen style is a "technical blueprint": a near-white page, ink-blue text, thin lines, numbered
sections, with violet for identity. Three colours each have one job: cobalt for what can be
clicked, violet for identity (the alias, labels, section numbers), teal for status.

## Options

1. **Tailwind's default palette used directly in the markup** (`text-neutral-600 dark:...`). Quick,
   but every page repeats colour decisions, and every element needs a second class for dark mode.
2. **Named tokens defined once in CSS**, with the light and dark value of each one side by side
   (`light-dark()`), exposed to Tailwind as utilities (`bg-bg`, `text-muted`). Pages use names,
   never colours.
3. **A component library or theme package.** More features than a static site needs, and its look
   would not be ours.

For the theme switch:

- Decide the theme in JavaScript after the page loads: simple, but visitors who chose the other
  theme see a flash of the wrong one on every page.
- A tiny inline script in `<head>` that applies a saved choice before the first paint, and CSS that
  follows the system setting when there is no saved choice.

## Decision

Option 2, with the inline script. Eleven colour tokens in `src/styles/global.css`, a type scale
(17 px body text, headings at 21, 26, 33 and 41 px), 6 px corners and Tailwind's 4 px spacing grid.
IBM Plex Sans and IBM Plex Mono are self-hosted from npm packages, Latin subsets only, and only the
main font file is preloaded.

## Consequences

- Changing a colour, or the whole style, is a change in one file. Dark mode needs no extra classes.
- Every text colour pair was measured for contrast before it was chosen; all pass AA. Automated
  checks with axe arrive with the end-to-end tests.
- No request goes to a font server: the visitor's IP is not sent to a third party and the site does
  not depend on another service to render.
- Without JavaScript the site still works and follows the system theme; the switch and the mobile
  menu button are simply not shown.
- `light-dark()` needs a browser from 2024 or later. Older browsers fall back to their default
  colours, which is acceptable for this site.
- The fonts add under 80 KB on a first visit (one variable file covers every weight of the main
  font; the monospaced font needs one file per weight), and the browser caches them afterwards.
