export type Theme = "light" | "dark"

const THEME_STORAGE_KEY = "eta-admin-theme"

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark"
}

export function getInitialTheme(): Theme {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (isTheme(storedTheme)) {
      return storedTheme
    }
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function applyTheme(theme: Theme, persist = true) {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme

  if (!persist) {
    return
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // The active page can still use the selected theme without persistence.
  }
}

export function initializeTheme() {
  const theme = getInitialTheme()
  applyTheme(theme, false)
  return theme
}
