/** Every page path, written once. Menus and links use these names, never a literal path. */
export const paths = {
  home: "/",
  projects: "/projects/",
  about: "/about/",
} as const;

/** Main navigation. Order here is the order on screen. */
export interface NavItem {
  readonly href: string;
  readonly label: string;
}

export const navigation: readonly NavItem[] = [
  { href: paths.home, label: "Home" },
  { href: paths.projects, label: "Projects" },
  { href: paths.about, label: "About" },
];

export const repositoryUrl = "https://github.com/zxxdev/zxxdev.github.io";
export const profileUrl = "https://github.com/zxxdev";

/** Normalises a path so "/about" and "/about/" are treated as the same page. */
export function normalisePath(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

/**
 * A project's page. Always under /projects/ and never at the top level:
 * GitHub serves each repository's own Pages site at zxxdev.github.io/<repo>/,
 * so a top-level page with a repository's name would clash with it.
 */
export function projectPath(id: string): string {
  return `${paths.projects}${id}/`;
}

/** True when `href` is the page being shown. */
export function isCurrent(href: string, currentPath: string): boolean {
  return normalisePath(href) === normalisePath(currentPath);
}

/**
 * True when the page being shown is inside the section `href` opens, such as a
 * project page under Projects. The home page is not a section: every path
 * starts with "/".
 */
export function isInSection(href: string, currentPath: string): boolean {
  const section = normalisePath(href);
  return section !== paths.home && normalisePath(currentPath).startsWith(section);
}
