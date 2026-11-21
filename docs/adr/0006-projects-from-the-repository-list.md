# 0006. List every public repository, with project files only where they add something

- **Status:** accepted
- **Date:** 2026-11-21

## Context

Since [0004](0004-projects-as-a-content-collection.md) every project on the site is a Markdown file.
That works for projects with a story to tell, but each new repository then needs a file before it
shows up, and two new addons were published without appearing on the site. The build already
fetches the account's repository list from GitHub ([0005](0005-github-data-at-build-time.md)), and
each repository already has a description, topics, languages and releases there.

## Options

1. **Keep a file per project.** Every repository is presented with care, but the site falls behind
   whenever a repository is published and nobody writes its file.
2. **Only the repository list.** Nothing to maintain, but a project that deserves its own text and
   screenshot cannot have them.
3. **Both:** every public repository becomes a project from its GitHub details, and a project file,
   when there is one, takes its place with its own text, tone and screenshot.

## Decision

Option 3.

- The site lists every public repository of the account that is not a fork, not archived and not
  the profile repository. For one without a project file it takes the description (cut at a word
  for the card), the topics, the languages with at least 10% of the code that the site knows, and
  the latest release, from which the status tag is built ("v1.0.0", or "In development" without a
  release). The tone comes from topics such as `world-of-warcraft` or `website`.
- The cover is the first picture in the repository's README that is one of its own files (png,
  jpg, webp or gif; badges and outside images are skipped), with the README's alternative text. It
  is shown as GitHub serves it, whole and never enlarged, and is not processed while building, so a
  slow GitHub cannot stop a build. Without such a picture, the cover is generated in the tone.
- Each of these projects gets a page under `/projects/` with its description and a link to its
  README, and the same GitHub facts as the others.
- They come after the project files, newest push first. The home page shows the featured projects
  and fills up to four cards with the latest others, so a new repository reaches it too.
- The site rebuilds every day instead of every Monday, so a new repository appears by the next day.
  Starting the deploy workflow by hand publishes it at once.
- The saved copy of GitHub data now keeps the description, topics and README picture of every listed
  repository, so the automatic projects still appear when GitHub does not answer.

## Consequences

- Publishing a repository with a good description and topics is enough to put it on the site.
- An automatic project says less than a written one. The page says that its text comes from GitHub
  and points to the README.
- What a repository is called on GitHub is what the site shows: a misleading description or topic
  shows up on the site too. Hiding a repository means archiving it or making it private.
- A daily build costs one workflow run a day, about a minute, with three API requests per
  repository.
- A README picture is loaded from raw.githubusercontent.com by the visitor's browser. If GitHub
  moves or deletes it, that cover breaks until the next build; the README is the place to fix it.
