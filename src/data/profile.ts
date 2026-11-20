/**
 * Content for the home and About pages, kept apart from the markup so the
 * pages only decide how things look. Projects are not here: each one is a
 * Markdown file in src/content/projects/.
 *
 * Privacy rule for everything in this file: no employers, city, dates or real
 * name. The story is told in a generic way on purpose.
 */
import type { Tone } from "./tones";

/** One step of the path on the About page. The order here is the order lived. */
export interface PathStage {
  readonly title: string;
  readonly summary: string;
}

export const path: readonly PathStage[] = [
  {
    title: "User support",
    summary:
      "Solving problems for the people who use the systems. This is where you learn what actually breaks.",
  },
  {
    title: "Systems administration",
    summary: "Keeping servers, networks, accounts and permissions running.",
  },
  {
    title: "Web development",
    summary: "Websites from start to finish.",
  },
  {
    title: "Now",
    summary: "Backend services and platforms: the projects on this site.",
  },
];

/** Line icons drawn by the Icon component. */
export type IconName = "check" | "document" | "person" | "badge";

/**
 * Microsoft exams passed. The certifications they led to have expired, so the
 * site says "exams passed" and never "certified". The names are the official
 * exam titles; a retired exam is marked as such. The order is the order they
 * were taken.
 */
export interface Exam {
  readonly code: string;
  /** Short plain-language area, used as the card title. */
  readonly area: string;
  /** The official exam title. */
  readonly name: string;
  readonly retired: boolean;
}

export const azureExams: readonly Exam[] = [
  {
    code: "AZ-700",
    area: "Azure networking",
    name: "Designing and Implementing Microsoft Azure Networking Solutions",
    retired: false,
  },
  {
    code: "AZ-104",
    area: "Azure administration",
    name: "Microsoft Azure Administrator",
    retired: false,
  },
  {
    code: "AZ-304",
    area: "Azure architecture design",
    name: "Microsoft Azure Architect Design",
    retired: true,
  },
];

/** One of the "How I work" points, shared with the GitHub profile. */
export interface Principle {
  readonly title: string;
  readonly text: string;
  readonly tone: Tone;
  readonly icon: IconName;
}

export const principles: readonly Principle[] = [
  {
    title: "Tested by default.",
    text: "Every repo has CI, and the progress badges are computed by the pipeline, never typed by hand.",
    // Teal: the same colour as "CI is green".
    tone: "teal",
    icon: "check",
  },
  {
    title: "Decisions written down.",
    text: "Important technical choices are recorded as short ADRs, including what they cost.",
    tone: "cobalt",
    icon: "document",
  },
  {
    title: "AI-assisted, human-reviewed.",
    text: "The code in these projects is written by AI agents under my direction. I decide what gets built, review every change and answer for every decision. Nothing reaches the main branch without passing tests and CI.",
    tone: "violet",
    icon: "person",
  },
];
