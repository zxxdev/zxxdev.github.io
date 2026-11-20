# 0005. Fetch GitHub data while building, with a committed fallback

- **Status:** accepted
- **Date:** 2026-11-20

## Context

Project pages should show what GitHub knows about each repository: when it last changed, its
languages, its latest release and its stars. Those figures must come from GitHub, never be typed by
hand, and a problem at GitHub must not stop the site from being published.

The site is static: GitHub Pages only serves files. Without a token, the GitHub API allows 60
requests an hour per IP address; with one, 5,000.

## Options

1. **Ask the API from the visitor's browser.** Always fresh, but every visitor spends from their own
   60-request allowance, a token cannot be used (everything sent to the browser is public), and the
   numbers vanish whenever the API is slow or down.
2. **Ask the API while building, and fail the build if it fails.** Data is fixed in the HTML and
   costs the visitor nothing, but an outage or a rate limit at GitHub stops every deployment,
   including fixes that have nothing to do with it.
3. **Ask the API while building, and fall back to a saved copy.** As option 2, but when any request
   fails the build uses `src/data/github-snapshot.json`, a copy committed to the repository, and
   says on the page that it did, and from when.
4. **Keep the last good answer in the CI cache** (for example `actions/cache`) instead of the
   repository. Fresher than a committed copy, but caches expire, are scoped to branches and are not
   visible in a review; a build on a new branch or after seven idle days would have no fallback.

## Decision

Option 3.

- `src/lib/github.ts` asks for the account's repository list (one request) and, for each project's
  repository, its languages and latest release (two requests). Each request has a 5-second timeout.
  Every answer is checked against a small schema; anything unexpected counts as a failure.
- **All or nothing.** If any request fails, the whole saved copy is used. A page never mixes fresh
  and saved numbers, and the note under the figures names the one it shows.
- The data is fetched once per build and shared by every page.
- In GitHub Actions the build gets the run's own short-lived token, read-only in these workflows,
  through `GITHUB_TOKEN`. It is used on the build machine only and never written into a page. A
  local build works without it.
- `pnpm github:snapshot` refreshes the saved copy with the same code. It keeps only the fields the
  site shows: repository names, dates, stars, language shares and release tags.
- The site rebuilds every Monday, so live figures are at most a week old.

## Consequences

- A GitHub outage never stops a deployment; the page says when it shows the saved copy.
- The figures can be up to a week old, or as old as the saved copy when GitHub fails. Stars and
  last-change dates do not need to be fresher than that.
- The saved copy is only as fresh as its last commit. Nothing refreshes it automatically yet; a
  scheduled job that opens a pull request with a new copy would be the next step if it starts to
  lag.
- Tests never touch the network: they pass a fake `fetch` that plays the API, including errors,
  timeouts, rate limits and answers of the wrong shape.
- The route test reads the account's repository list from the saved copy, so it covers every
  repository GitHub listed at the last refresh, not only those with a project page.
