/**
 * The two languages: addresses, the language chosen for a browser, the
 * interface text, and that every page and every project file exists in both.
 * Reads files only; it never starts Astro.
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { profile } from "../src/data/profile";
import { locales, otherLocale, preferredLocale } from "../src/i18n/locales";
import {
  alternates,
  isInSection,
  pagePaths,
  projectPath,
  routePath,
  type PageKey,
} from "../src/i18n/routes";
import { ui } from "../src/i18n/ui";
import { projectFiles, projectsDir, spanishProjectsDir } from "../src/lib/project-files";

const pagesDir = new URL("../src/pages/", import.meta.url);
const pageKeys = Object.keys(pagePaths.en) as PageKey[];

describe("addresses", () => {
  it("keeps the English pages where they were before the Spanish version", () => {
    expect(pagePaths.en).toEqual({ home: "/", projects: "/projects/", about: "/about/" });
  });

  it("puts every Spanish page under /es/", () => {
    for (const path of Object.values(pagePaths.es)) expect(path.startsWith("/es/")).toBe(true);
  });

  it("puts a project's page under its language's Projects section", () => {
    expect(projectPath("en", "trailmate")).toBe("/projects/trailmate/");
    expect(projectPath("es", "trailmate")).toBe("/es/proyectos/trailmate/");
  });

  it("lists the same page in every language, for hreflang", () => {
    expect(alternates({ page: "about" })).toEqual([
      { locale: "en", path: "/about/" },
      { locale: "es", path: "/es/sobre-mi/" },
    ]);
  });

  it("marks Projects as the section of a project's page, but never a home page", () => {
    expect(isInSection("/projects/", "/projects/trailmate/")).toBe(true);
    expect(isInSection("/es/proyectos/", "/es/proyectos/trailmate/")).toBe(true);
    expect(isInSection("/projects/", "/about/")).toBe(false);
    expect(isInSection("/", "/projects/trailmate/")).toBe(false);
    expect(isInSection("/es/", "/es/proyectos/trailmate/")).toBe(false);
  });
});

describe("the language for a browser", () => {
  it("takes the first language the site has, in the browser's order", () => {
    expect(preferredLocale(["es-ES", "en-GB"])).toBe("es");
    expect(preferredLocale(["en-US", "es"])).toBe("en");
    expect(preferredLocale(["fr-FR", "es-MX", "en"])).toBe("es");
  });

  it("falls back to English when the browser has none of them", () => {
    expect(preferredLocale(["fr-FR", "de"])).toBe("en");
    expect(preferredLocale([])).toBe("en");
  });

  it("ignores case and the region", () => {
    expect(preferredLocale(["ES-ar"])).toBe("es");
  });

  it("offers the other language in the switch", () => {
    expect(otherLocale("en")).toBe("es");
    expect(otherLocale("es")).toBe("en");
  });
});

/** Every text in a dictionary, with where it is, calling the ones that take a number. */
function texts(value: unknown, path = ""): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  if (typeof value === "function") {
    return [
      [`${path}(1)`, String((value as (n: number) => unknown)(1))],
      [`${path}(2)`, String((value as (n: number) => unknown)(2))],
    ];
  }
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).flatMap(([key, child]) =>
      texts(child, path ? `${path}.${key}` : key),
    );
  }
  return [];
}

describe("interface text", () => {
  it("has the same texts in every language", () => {
    const keys = texts(ui.en).map(([key]) => key);
    for (const locale of locales) expect(texts(ui[locale]).map(([key]) => key)).toEqual(keys);
  });

  it("leaves no text empty", () => {
    for (const locale of locales) {
      const empty = texts(ui[locale]).filter(([, text]) => text.trim() === "");
      expect(empty.map(([key]) => key)).toEqual([]);
    }
  });

  it("names each language in that language, for the switch", () => {
    expect(ui.en.languageName).toBe("English");
    expect(ui.es.languageName).toBe("Español");
  });

  it("counts projects in the right number", () => {
    expect(ui.es.home.building(1)).toBe("Construyendo en público · 1 proyecto");
    expect(ui.en.home.building(3)).toBe("Building in public · 3 projects");
  });

  it("has the same home and About content in every language", () => {
    for (const locale of locales) {
      expect(profile[locale].path).toHaveLength(profile.en.path.length);
      expect(profile[locale].principles.map((p) => [p.tone, p.icon])).toEqual(
        profile.en.principles.map((p) => [p.tone, p.icon]),
      );
      expect(profile[locale].azureExams.map((exam) => exam.code)).toEqual(
        profile.en.azureExams.map((exam) => exam.code),
      );
    }
  });
});

/** Every .astro file under src/pages/, as a path relative to it. */
function pageFiles(dir: URL = pagesDir, prefix = ""): string[] {
  return readdirSync(dir).flatMap((name) => {
    const child = new URL(name, dir);
    if (statSync(child).isDirectory()) return pageFiles(new URL(`${name}/`, dir), `${prefix}${name}/`);
    return name.endsWith(".astro") ? [`${prefix}${name}`] : [];
  });
}

/** The file that answers a path: "/es/sobre-mi/" is es/sobre-mi.astro or es/sobre-mi/index.astro. */
function pageFileFor(path: string, files: readonly string[]): string | undefined {
  const inside = path.slice(1);
  const candidates = inside === "" ? ["index.astro"] : [`${inside}index.astro`, `${inside.slice(0, -1)}.astro`];
  return candidates.find((candidate) => files.includes(candidate));
}

describe("every page in both languages", () => {
  const files = pageFiles();

  it("has a page file for every page in every language", () => {
    for (const locale of locales) {
      for (const page of pageKeys) {
        const path = routePath(locale, { page });
        expect(pageFileFor(path, files), `${locale} ${page} (${path})`).toBeDefined();
      }
      expect(files).toContain(`${pagePaths[locale].projects.slice(1)}[id].astro`);
    }
  });

  it("has no page that is missing in the other language", () => {
    // 404.astro is the one page for every missing address, written in both languages.
    const expected = new Set([
      "404.astro",
      ...locales.flatMap((locale) => [
        ...pageKeys.map((page) => pageFileFor(routePath(locale, { page }), files)),
        `${pagePaths[locale].projects.slice(1)}[id].astro`,
      ]),
    ]);
    expect(files.filter((file) => !expected.has(file))).toEqual([]);
  });
});

describe("every project file in both languages", () => {
  it("has a Spanish version of every project file, and none without one", () => {
    expect(existsSync(spanishProjectsDir)).toBe(true);
    expect(projectFiles(spanishProjectsDir)).toEqual(projectFiles(projectsDir));
  });
});
