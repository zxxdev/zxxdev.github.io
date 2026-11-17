/** Main navigation. Order here is the order on screen. */
export interface NavItem {
  readonly href: string;
  readonly label: string;
}

export const navigation: readonly NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/projects/", label: "Projects" },
  { href: "/about/", label: "About" },
];

export const repositoryUrl = "https://github.com/zxxdev/zxxdev.github.io";
export const profileUrl = "https://github.com/zxxdev";

/** Normalises a path so "/about" and "/about/" are treated as the same page. */
export function normalisePath(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

/** True when `href` is the page being shown. */
export function isCurrent(href: string, currentPath: string): boolean {
  return normalisePath(href) === normalisePath(currentPath);
}
