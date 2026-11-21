# 0007. Serve the site in English and Spanish, with English at its existing addresses

- **Status:** accepted
- **Date:** 2026-11-21

## Context

The site was English only, and its pages were already linked from the GitHub profile, the
repositories and a CV: `/`, `/projects/`, `/about/`. It also has to be readable in Spanish. Each
language needs its own address, so a page can be linked and indexed in either one, and search
engines must know the two are the same page. GitHub Pages only serves files: there is no server to
read the browser's `Accept-Language` header and answer in the right language.

## Options

1. **Both languages under a prefix** (`/en/…` and `/es/…`), with `/` choosing one. Symmetric and
   easy to explain, but every address already shared breaks, unless each one gets a redirect page,
   and `/` becomes a page that only redirects.
2. **English where it is, Spanish under `/es/`.** No shared link breaks. The two languages are not
   symmetric: English has no prefix.
3. **One address, the language switched in the browser.** Nothing to change in the addresses, but
   search engines only ever see one language, and a link cannot point at the Spanish version.

Astro's built-in i18n routing can do option 2 (`prefixDefaultLocale: false`), but it keeps the same
words in the path in every language (`/es/projects/`), and it adds behaviour this site does not need.

## Decision

Option 2, with a small module of our own instead of Astro's i18n routing.

- **Addresses.** `src/i18n/routes.ts` writes every page's path in each language once:
  `/`, `/projects/`, `/about/` and `/es/`, `/es/proyectos/`, `/es/sobre-mi/`. A project's page is
  `/projects/<id>/` and `/es/proyectos/<id>/`, never at the top level (GitHub serves each
  repository's own site at `/<repo>/`).
- **Each page written once.** The markup lives in `src/views/`; the files in `src/pages/` only say
  which language. All interface text is in one dictionary per language (`src/i18n/ui.ts`), and the
  Spanish one must have the same shape as the English one, or the type check fails. Dates and
  numbers follow each language (`18 Nov 2026`, `18 nov 2026`; `78.4%`, `78,4 %`).
- **Project files.** The English file holds the data. Its Spanish version, with the same name in
  `src/content/projects/es/`, holds only the words (title if it changes, summary, the cover's text)
  and the page's text. A project file without its translation, or the other way round, stops the
  build. A project made from GitHub alone keeps its English description, marked `lang="en"`, with a
  line saying so.
- **Telling search engines.** Every page lists its versions with `<link rel="alternate" hreflang>`
  plus `x-default` (English), and `<html lang>` says the page's language.
- **The switch.** A link in the header opens the same page in the other language. It shows that
  language's name in that language ("Español", "English"), so someone who cannot read the page can
  still read the way out. It works without JavaScript; a few lines of script remember the choice.
- **The browser's language, only on the English home page.** Before the page is drawn, an inline
  script sends the visitor to `/es/` when they arrive from outside the site, have never used the
  switch, and their browser lists Spanish before English. A link to any other page opens what was
  linked, and moving around the site never changes the language on its own. Other repositories'
  Pages sites share this origin (`/<repo>/`), so "from the site" also checks the path. The decision
  is one function, `opensSpanishHome()` in `src/i18n/home-redirect.ts`, written into the page with
  `toString()`: the code the unit tests check is the code the browser runs.
- **The "page not found" page** is a single file for the whole site (GitHub Pages serves one
  `404.html`), so it says the same in both languages.

## Consequences

- No link already shared breaks, and each language can be linked, indexed and tested on its own.
- Unit tests fail if a page exists in one language only, if a project file has no translation, or if
  the dictionaries differ in shape.
- English and Spanish are not symmetric: English has no prefix. Adding a third language would follow
  the Spanish pattern (`/xx/…`).
- The redirect function must not use anything outside its own body, because it is copied into the
  page as text. A unit test rebuilds it from that text and runs every case, so breaking the rule
  fails in CI. The end-to-end tests in the roadmap should still cover the redirect in a browser.
- If the header's script fails to load while the rest of the page works, the mobile menu stays
  folded with a button that does nothing. Accepted as a small risk: the alternative brings back a
  row of links that jumps away on every page load.
- A Spanish visitor who arrives on an inner English page stays there; the switch is one click away.
- Texts that come from GitHub (descriptions) and the generated covers' captions stay in English.
- Every page is built twice, so the build takes a little longer.
