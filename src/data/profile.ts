/**
 * Content for the home and About pages, in each language, kept apart from the
 * markup so the pages only decide how things look. Projects are not here: each
 * one is a Markdown file in src/content/projects/ (English) and
 * src/content/projects/es/ (Spanish).
 *
 * Privacy rule for everything in this file: no employers, city, dates or real
 * name. The story is told in a generic way on purpose.
 */
import type { Locale } from "../i18n/locales";
import type { Tone } from "./tones";

/** One step of the path on the About page. The order here is the order lived. */
export interface PathStage {
  readonly title: string;
  readonly summary: string;
}

/** Line icons drawn by the Icon component. */
export type IconName = "check" | "document" | "person" | "badge";

/**
 * Microsoft exams passed. The certifications they led to have expired, so the
 * site says "exams passed" and never "certified". The order is the order they
 * were taken.
 */
export interface Exam {
  readonly code: string;
  /** Short plain-language area, used as the card title. */
  readonly area: string;
  /**
   * The official exam title, in English in every language: it is the name
   * Microsoft lists the exam under, so the page marks it as English.
   */
  readonly name: string;
  readonly retired: boolean;
}

/** One of the "How I work" points, shared with the GitHub profile. */
export interface Principle {
  readonly title: string;
  readonly text: string;
  readonly tone: Tone;
  readonly icon: IconName;
}

/** The About page's introduction: paragraphs of plain text, then the exams paragraph. */
export interface AboutText {
  readonly intro: readonly string[];
  /** "I've passed Microsoft's Azure exams in …": the text before each exam code, then the end. */
  readonly examsSentence: {
    readonly parts: readonly [string, string, string];
    readonly end: string;
  };
}

export interface Profile {
  readonly path: readonly PathStage[];
  readonly azureExams: readonly Exam[];
  readonly principles: readonly Principle[];
  readonly about: AboutText;
}

/** The exam codes and official titles: the same in every language. */
const exams = [
  {
    code: "AZ-700",
    name: "Designing and Implementing Microsoft Azure Networking Solutions",
    retired: false,
  },
  { code: "AZ-104", name: "Microsoft Azure Administrator", retired: false },
  { code: "AZ-304", name: "Microsoft Azure Architect Design", retired: true },
] as const;

/** The same principle in every language keeps its colour and icon. */
const principleLook = [
  // Teal: the same colour as "CI is green".
  { tone: "teal", icon: "check" },
  { tone: "cobalt", icon: "document" },
  { tone: "violet", icon: "person" },
] as const satisfies readonly { tone: Tone; icon: IconName }[];

const en: Profile = {
  path: [
    {
      title: "User support",
      summary:
        "Solving problems for the people who use the systems. This is where you learn what actually breaks.",
    },
    {
      title: "Systems administration",
      summary: "Keeping servers, networks, accounts and permissions running.",
    },
    { title: "Web development", summary: "Websites from start to finish." },
    { title: "Now", summary: "Backend services and platforms: the projects on this site." },
  ],
  azureExams: [
    { ...exams[0], area: "Azure networking" },
    { ...exams[1], area: "Azure administration" },
    { ...exams[2], area: "Azure architecture design" },
  ],
  principles: [
    {
      ...principleLook[0],
      title: "Tested by default.",
      text: "Every repo has CI, and the progress badges are computed by the pipeline, never typed by hand.",
    },
    {
      ...principleLook[1],
      title: "Decisions written down.",
      text: "Important technical choices are recorded as short ADRs, including what they cost.",
    },
    {
      ...principleLook[2],
      title: "AI-assisted, human-reviewed.",
      text: "The code in these projects is written by AI agents under my direction. I decide what gets built, review every change and answer for every decision. Nothing reaches the main branch without passing tests and CI.",
    },
  ],
  about: {
    intro: [
      "I'm a computer engineer. I've spent years on the operations side: running systems, supporting users and building websites.",
      "That work teaches things tutorials don't: what actually breaks, what people need when something stops working, and what it costs to maintain what someone else left half-finished. Now I build software for those same problems: support workflows, deployments, observability and automation.",
      "The systems background shows in how I work. Before I call something done, I ask what happens when it fails, who will maintain it and how anyone can tell it works. That's why every project has tests, every important decision is written down, and every figure on this site is computed by CI.",
      "The code in these projects is written by AI agents under my direction. I decide what gets built, review every change and answer for every decision. Nothing reaches the main branch without passing tests and CI.",
    ],
    examsSentence: {
      parts: [
        "I've passed Microsoft's Azure exams in networking",
        ", administration",
        " and architecture design",
      ],
      end: ". At home I run a small virtualization server where I test these projects.",
    },
  },
};

const es: Profile = {
  path: [
    {
      title: "Soporte a usuarios",
      summary:
        "Resolver las incidencias de quien usa los sistemas. Aquí se aprende qué falla de verdad.",
    },
    {
      title: "Administración de sistemas",
      summary: "Mantener en marcha servidores, redes, cuentas y permisos.",
    },
    { title: "Desarrollo web", summary: "Sitios web de principio a fin." },
    { title: "Ahora", summary: "Servicios backend y plataformas: los proyectos de esta web." },
  ],
  azureExams: [
    { ...exams[0], area: "Redes en Azure" },
    { ...exams[1], area: "Administración de Azure" },
    { ...exams[2], area: "Diseño de arquitectura en Azure" },
  ],
  principles: [
    {
      ...principleLook[0],
      title: "Probado por defecto.",
      text: "Cada repo tiene CI, y las insignias de avance las calcula la CI: nunca se escriben a mano.",
    },
    {
      ...principleLook[1],
      title: "Decisiones por escrito.",
      text: "Las decisiones técnicas importantes quedan en documentos cortos (ADR), con lo que cuestan incluido.",
    },
    {
      ...principleLook[2],
      title: "Con IA, revisado por una persona.",
      text: "El código de estos proyectos lo escriben agentes de IA bajo mi dirección. Yo decido qué se construye, reviso cada cambio y respondo de cada decisión. Nada llega a la rama principal sin pasar los tests y la CI.",
    },
  ],
  about: {
    intro: [
      "Soy ingeniero informático. He pasado varios años en el lado de operaciones: administrando sistemas, dando soporte a usuarios y haciendo desarrollo web.",
      "Ese trabajo enseña cosas que no salen en los tutoriales: qué falla de verdad, qué pide la gente cuando algo no funciona y cuánto cuesta mantener lo que otro dejó a medias. Ahora construyo software para esos mismos problemas: flujos de soporte, despliegues, observabilidad y automatización.",
      "Venir de sistemas se nota en cómo lo hago. Antes de dar algo por terminado me pregunto qué pasa cuando falla, quién lo va a mantener y cómo se comprueba que funciona. Por eso cada proyecto tiene tests, cada decisión importante está escrita y cada cifra de esta web la calcula la CI.",
      "El código de estos proyectos lo escriben agentes de IA bajo mi dirección. Yo decido qué se construye, reviso cada cambio y respondo de cada decisión. Nada llega a la rama principal sin pasar los tests y la CI.",
    ],
    examsSentence: {
      parts: [
        "He aprobado los exámenes de Azure de Microsoft de redes",
        ", administración",
        " y diseño de arquitectura",
      ],
      end: ". En casa tengo un pequeño servidor de virtualización donde pruebo estos proyectos.",
    },
  },
};

export const profile: Readonly<Record<Locale, Profile>> = { en, es };
