/**
 * Every piece of interface text, in every language. Pages and components take
 * their words from here, never from a literal in the markup.
 *
 * `es` must have exactly the shape of `en` (the type checker says so), and a
 * unit test checks that no text is left empty. The Spanish is written for
 * Spain, and it is not a word-for-word translation: it says the same thing the
 * way someone writing in Spanish would.
 *
 * Longer content lives elsewhere: the home and About text in
 * src/data/profile.ts, and each project's text in its Markdown file.
 */
import type { Locale } from "./locales";

const en = {
  /** Name of this language, written in it: what the language switch shows. */
  languageName: "English",
  skipToContent: "Skip to content",
  mainNavigation: "Main",
  menu: "Menu",
  nav: { home: "Home", projects: "Projects", about: "About" },
  themeToDark: "Switch to dark theme",
  themeToLight: "Switch to light theme",
  footer: { builtWith: "Built with", source: "Source on GitHub" },

  home: {
    title: "zxxdev · Systems engineer",
    description:
      "Systems engineer. Backend services and platforms, with tests, CI and documented decisions.",
    building: (count: number) =>
      `Building in public · ${String(count)} ${count === 1 ? "project" : "projects"}`,
    headline: "Systems engineer building backend services and the platforms they run on.",
    lead: "I spent years in operations: running systems, supporting users and building websites. Now I build software for the problems I used to solve by hand.",
    viewProjects: "View projects",
    about: "About",
    projects: "Projects",
    seeAllProjects: "See all projects",
    howIWork: "How I work",
    technologies: "Technologies",
    technologiesNote: "Only what actually shows up in the repos.",
  },

  technologyGroups: {
    languages: "Languages",
    web: "Web",
    quality: "Testing and code quality",
    ci: "CI and supply chain",
  },

  about: {
    title: "About · zxxdev",
    description:
      "From running systems and supporting users to building backend services and platforms.",
    heading: "About",
    onThisPage: "On this page",
    sections: { intro: "Intro", path: "Path", exams: "Azure exams" },
    pathHeading: "The path so far",
    examsHeading: "Azure exams",
    examsNote: "Microsoft exams I've passed. The certifications they led to have since expired.",
    retiredExam: "retired exam",
    contactBefore: "The way to reach me is ",
    contactAfter: ".",
  },

  projects: {
    title: "Projects · zxxdev",
    heading: "Projects",
    description: "What I'm building, with its actual status.",
    filterLabel: "Filter by technology",
    filterAll: "All",
    listHeading: "Project list",
    /** Read by the filter's script: {total} and {shown} are filled in there. */
    showingAll: "Showing all {total} projects.",
    showingSome: "Showing {shown} of {total} projects.",
  },

  card: { updated: "updated", stack: "Stack" },

  project: {
    titleSuffix: "Projects · zxxdev",
    allProjects: "All projects",
    viewOnGitHub: "View on GitHub",
    liveDemo: "Live demo",
    readReadme: "Read the README",
    /** Under a description that is not in the page's language. */
    descriptionFromGitHub: "Description from GitHub, in English.",
    documentation: "Documentation",
    documentationBefore: "Installation, usage and known limits are in the repository's ",
    documentationAfter: ". This page is built from the repository's details on GitHub.",
    facts: "Project facts",
    stack: "Stack",
    tooling: "Tooling",
    source: "Source",
    onGitHub: "On GitHub",
    fromApiBefore: "From the GitHub API on ",
    fromApiAfter: ", when this page was built.",
    savedCopyBefore: "Saved copy from ",
    savedCopyAfter: ": GitHub did not answer when this page was built.",
  },

  github: {
    lastUpdated: "Last updated",
    release: "GitHub release",
    noRelease: "None yet",
    stars: "Stars",
    languages: "Languages",
    /** The share of the code GitHub puts together under "Other". */
    otherLanguages: "Other",
  },

  status: { live: "Live", development: "In development" },

  /** Summary of a repository with no description on GitHub. */
  noDescription: "No description on GitHub yet.",
};

/** The shape every language must have: the English one. */
export type UiStrings = typeof en;

const es: UiStrings = {
  languageName: "Español",
  skipToContent: "Saltar al contenido",
  mainNavigation: "Principal",
  menu: "Menú",
  nav: { home: "Inicio", projects: "Proyectos", about: "Sobre mí" },
  themeToDark: "Cambiar a tema oscuro",
  themeToLight: "Cambiar a tema claro",
  footer: { builtWith: "Hecha con", source: "Código en GitHub" },

  home: {
    title: "zxxdev · Ingeniero de sistemas",
    description:
      "Ingeniero de sistemas. Servicios backend y plataformas, con tests, CI y decisiones documentadas.",
    building: (count: number) =>
      `Construyendo en público · ${String(count)} ${count === 1 ? "proyecto" : "proyectos"}`,
    headline:
      "Ingeniero de sistemas. Construyo servicios backend y las plataformas donde se ejecutan.",
    lead: "Pasé años en operaciones: administrar sistemas, dar soporte y hacer webs. Ahora construyo el software para los problemas que antes resolvía a mano.",
    viewProjects: "Ver proyectos",
    about: "Sobre mí",
    projects: "Proyectos",
    seeAllProjects: "Ver todos los proyectos",
    howIWork: "Cómo trabajo",
    technologies: "Tecnologías",
    technologiesNote: "Solo las que aparecen en los repos.",
  },

  technologyGroups: {
    languages: "Lenguajes",
    web: "Web",
    quality: "Tests y calidad del código",
    ci: "CI y cadena de suministro",
  },

  about: {
    title: "Sobre mí · zxxdev",
    description:
      "De administrar sistemas y dar soporte a construir servicios backend y plataformas.",
    heading: "Sobre mí",
    onThisPage: "En esta página",
    // Short, so the three fit in one row on a 360 px phone.
    sections: { intro: "Presentación", path: "Trayectoria", exams: "Exámenes" },
    pathHeading: "La trayectoria hasta ahora",
    examsHeading: "Exámenes de Azure",
    examsNote:
      "Exámenes de Microsoft que he aprobado. Las certificaciones que obtuve con ellos ya han caducado.",
    retiredExam: "examen retirado",
    contactBefore: "Para contactar conmigo, ",
    contactAfter: ".",
  },

  projects: {
    title: "Proyectos · zxxdev",
    heading: "Proyectos",
    description: "Lo que estoy construyendo, con su estado real.",
    filterLabel: "Filtrar por tecnología",
    filterAll: "Todos",
    listHeading: "Lista de proyectos",
    showingAll: "Se muestran los {total} proyectos.",
    showingSome: "Se muestran {shown} de {total} proyectos.",
  },

  card: { updated: "actualizado el", stack: "Stack" },

  project: {
    titleSuffix: "Proyectos · zxxdev",
    allProjects: "Todos los proyectos",
    viewOnGitHub: "Ver en GitHub",
    liveDemo: "Ver la demo",
    readReadme: "Leer el README",
    descriptionFromGitHub: "Descripción tomada de GitHub, en inglés.",
    documentation: "Documentación",
    documentationBefore: "La instalación, el uso y los límites conocidos están en el ",
    documentationAfter:
      " del repositorio, en inglés. Esta página se genera con los datos del repositorio en GitHub.",
    facts: "Datos del proyecto",
    stack: "Stack",
    tooling: "Herramientas",
    source: "Código",
    onGitHub: "En GitHub",
    fromApiBefore: "Datos de la API de GitHub del ",
    fromApiAfter: ", cuando se generó esta página.",
    savedCopyBefore: "Copia guardada del ",
    savedCopyAfter: ": GitHub no respondió cuando se generó esta página.",
  },

  github: {
    lastUpdated: "Última actualización",
    release: "Release en GitHub",
    noRelease: "Ninguna todavía",
    stars: "Estrellas",
    languages: "Lenguajes",
    otherLanguages: "Otros",
  },

  status: { live: "Publicado", development: "En desarrollo" },

  noDescription: "Todavía no tiene descripción en GitHub.",
};

export const ui: Readonly<Record<Locale, UiStrings>> = { en, es };
