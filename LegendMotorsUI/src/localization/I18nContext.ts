import { createContext } from "react"
import type { Direction, Language, TranslationParams } from "./i18n"

export type I18nContextValue = {
  language: Language
  direction: Direction
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
  t: (key: string, params?: TranslationParams) => string
  formatNumber: (value: number) => string
}

export const I18nContext = createContext<I18nContextValue | null>(null)
