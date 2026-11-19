# 0003. Redesign for a sharper look, with one colour per kind of project

- **Status:** accepted
- **Date:** 2026-11-18
- **Supersedes:** the palette, fonts and colour roles of [0002](0002-design-tokens-and-theme.md).
  The token system of 0002 (named colours, `light-dark()`, the theme switch) stays.

## Context

The first design worked technically, but read as documentation rather than a portfolio: all text,
thin rules between sections, a navy dark theme with a pastel button, and nothing to look at on the
project list. The goal was a modern look with images, using portfolio sites with large project
covers as a reference for structure only.

A first attempt added a glow, a grid behind the headline, a blurred header and gradient covers. It
looked soft. Comparing it with sharper sites showed why: they use near-black and neutral greys,
cards with no fill and a hairline border, body text in the main text colour, and nothing blurred.
Taking all that out made the page sharp but almost colourless, so colour came back as solid fills
with a meaning.

## Options

1. **Keep the first design** and only add covers. Cheap, but it keeps what made it look dated.
2. **Soft modern look** (glow, gradients, blur, translucent header). Common and easy to like, but
   it lowers sharpness and contrast, and it is what many templates look like.
3. **Sharp and flat, with colour only where it means something.** Near-black and neutral greys,
   cards with no fill, solid colours only, and a closed list of tones, one per kind of project.

## Decision

Option 3.

- **Fonts:** Geist Sans and Geist Mono instead of IBM Plex, self-hosted. Page and section headings
  are weight 500; card and list item titles are 600. Nothing heavier.
- **Colour roles:**
  - violet is the identity and the primary button (`brand`);
  - cobalt is for links inside text;
  - teal is for "live".
- **Project tones:** a closed list, `violet` (web), `cobalt` (backend), `teal` (platform) and
  `amber` (tools and games). It is typed in `src/data/profile.ts`, so a tone outside the list is a
  type error. A project's tone colours its generated cover and its card border on hover. The same
  four colours are reused, by meaning, in a few other places: the How I work icons (teal for
  "tested", the colour of a green CI; cobalt for "decisions"; violet for "AI-assisted", the
  identity), and the dots of the path and the Azure exam icons on the About page (violet). They are
  never used for text blocks, technology pills or the project status.
- **Nothing blurred:** no glows, gradients, shadows or backdrop blur. The header is sticky with a
  solid background.

Contrast, computed with the WCAG 2.1 formula:

| Pair                                        | Dark  | Light |
| ------------------------------------------- | ----- | ----- |
| Text on background                          | 17.11 | 19.80 |
| Text on `surface` (status tags)             | 16.25 | 19.80 |
| Muted text on background                    | 7.94  | 6.48  |
| Muted text on `surface-2` (pills)           | 7.11  | 5.90  |
| Link (`accent`) on background               | 8.25  | 6.70  |
| Violet (alias, visited links) on background | 9.23  | 7.10  |
| White on the primary button                 | 5.70  | 7.10  |
| White on the button when hovered            | 7.10  | 8.98  |
| Skip link: `on-accent` on `accent`          | 8.25  | 6.70  |
| Text on the selection colour                | 13.35 | 14.58 |
| Violet tone text on its tone background     | 8.15  | 7.77  |
| Cobalt tone text on its tone background     | 7.12  | 7.57  |
| Teal tone text on its tone background       | 11.01 | 6.77  |
| Amber tone text on its tone background      | 9.31  | 6.44  |

## Consequences

- The site looks sharper and has colour that says something: with twelve projects, the tone tells
  what kind each one is instead of turning into a rainbow.
- The hover colour of the primary button gets darker in dark theme, not lighter: a lighter violet
  with white text would drop to 4.23, below AA.
- In light theme, amber text uses the darker shade (`#92400e`): the base amber is only 4.56 on its
  background, too close to the limit.
- Geist is a popular font, so the identity rests on the violet, the square avatar and the mono
  labels, not on the font.
- Covers are generated from data until a project has a real screenshot. Screenshots are the next
  step and must not show names, hosts or anything personal.
- Contrast is still checked by hand. Automated checks arrive with the accessibility tests.
