# Architecture decision records

Each record explains one decision: the problem, the options considered, what was chosen and what it
costs. New records copy [template.md](template.md) and take the next number.

| #                                                 | Decision                                                                  | Status                              |
| ------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------- |
| [0001](0001-use-astro-for-a-static-site.md)       | Use Astro to build the site as static pages                               | accepted                            |
| [0002](0002-design-tokens-and-theme.md)           | Define the design as named tokens, with a light and dark theme            | accepted, partly superseded by 0003 |
| [0003](0003-sharp-redesign-and-project-tones.md)  | Redesign for a sharper look, with one colour per kind of project          | accepted                            |
| [0004](0004-projects-as-a-content-collection.md)  | Keep each project in a Markdown file checked by a schema                  | accepted                            |
| [0005](0005-github-data-at-build-time.md)         | Fetch GitHub data while building, with a committed fallback               | accepted, rebuild daily since 0006  |
| [0006](0006-projects-from-the-repository-list.md) | List every public repository, with project files where they add something | accepted                            |
