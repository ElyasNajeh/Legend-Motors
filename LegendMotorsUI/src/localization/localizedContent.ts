import type { Language } from "./i18n"

export function localizedPair(english: string, arabic: string, language: Language) {
  return language === "ar"
    ? { primary: arabic, secondary: english, primaryLanguage: "ar", secondaryLanguage: "en" } as const
    : { primary: english, secondary: arabic, primaryLanguage: "en", secondaryLanguage: "ar" } as const
}

export function localizedOptional(english: string | null, arabic: string | null, language: Language) {
  const pair = localizedPair(english ?? "", arabic ?? "", language)
  return {
    primary: pair.primary || pair.secondary,
    secondary: pair.primary && pair.secondary ? pair.secondary : "",
    primaryLanguage: pair.primary ? pair.primaryLanguage : pair.secondaryLanguage,
    secondaryLanguage: pair.secondaryLanguage,
  }
}
