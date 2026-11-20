/**
 * Colour tones, a closed list: one per kind of project, so colour means
 * something. The values live in global.css under [data-tone]. A tone that is
 * not in this list is a type error in code and a build error in a project file.
 * - violet: web and front end (also the site's identity)
 * - cobalt: backend services and APIs
 * - teal: platform and infrastructure
 * - amber: tools and games
 */
export const tones = ["violet", "cobalt", "teal", "amber"] as const;

export type Tone = (typeof tones)[number];
