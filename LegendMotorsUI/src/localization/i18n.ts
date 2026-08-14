import en from "./locales/en.json"
import ar from "./locales/ar.json"

export type Language = "en" | "ar"
export type Direction = "ltr" | "rtl"
export type TranslationParams = Record<string, string | number>

export const LANGUAGE_STORAGE_KEY = "eta-language"
export const messages = { en, ar } as const

export function getInitialLanguage(): Language {
  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (saved === "en" || saved === "ar") return saved
  } catch {
    // Storage may be unavailable in privacy-restricted browsers.
  }

  return window.navigator.language.toLocaleLowerCase().startsWith("ar") ? "ar" : "en"
}

export function directionFor(language: Language): Direction {
  return language === "ar" ? "rtl" : "ltr"
}

export function applyDocumentLanguage(language: Language) {
  document.documentElement.lang = language
  document.documentElement.dir = directionFor(language)
  document.documentElement.dataset.language = language
}

export function initializeI18n() {
  applyDocumentLanguage(getInitialLanguage())
}

export function getMessage(language: Language, key: string, params: TranslationParams = {}) {
  const value = key.split(".").reduce<unknown>((current, part) => {
    if (!current || typeof current !== "object") return undefined
    return (current as Record<string, unknown>)[part]
  }, messages[language])
  const fallback = key.split(".").reduce<unknown>((current, part) => {
    if (!current || typeof current !== "object") return undefined
    return (current as Record<string, unknown>)[part]
  }, messages.en)
  const template = typeof value === "string" ? value : typeof fallback === "string" ? fallback : key

  return template.replace(/{{(\w+)}}/g, (_, name: string) => String(params[name] ?? ""))
}
