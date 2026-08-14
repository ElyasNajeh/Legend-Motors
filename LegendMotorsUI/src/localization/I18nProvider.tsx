import { useLayoutEffect, useMemo, useState, type ReactNode } from "react"
import { applyDocumentLanguage, directionFor, getInitialLanguage, getMessage, LANGUAGE_STORAGE_KEY, type Language } from "./i18n"
import { I18nContext, type I18nContextValue } from "./I18nContext"

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)

  const setLanguage = (nextLanguage: Language) => {
    applyDocumentLanguage(nextLanguage)
    setLanguageState(nextLanguage)
  }

  useLayoutEffect(() => {
    applyDocumentLanguage(language)
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    } catch {
      // The selected language still applies for the current session.
    }
  }, [language])

  const value = useMemo<I18nContextValue>(() => ({
    language,
    direction: directionFor(language),
    setLanguage,
    toggleLanguage: () => setLanguage(language === "ar" ? "en" : "ar"),
    t: (key, params) => getMessage(language, key, params),
    formatNumber: (number) => new Intl.NumberFormat(language === "ar" ? "ar-PS" : "en-PS").format(number),
  }), [language])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
