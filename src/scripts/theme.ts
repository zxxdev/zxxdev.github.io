export type Theme = "light" | "dark";

export const storageKey = "theme";

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

/** The theme on screen: the saved choice if there is one, otherwise the system's. */
export function effectiveTheme(saved: string | undefined | null, systemPrefersDark: boolean): Theme {
  if (isTheme(saved)) return saved;
  return systemPrefersDark ? "dark" : "light";
}

export function otherTheme(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark";
}

/** Shows `theme` now and remembers it for the next visit. */
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset["theme"] = theme;
  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    // Storage can be blocked (private mode, strict settings). The theme still
    // changes for this page; it just will not be remembered.
  }
}
