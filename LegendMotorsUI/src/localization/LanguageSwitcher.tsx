import { useI18n } from "./useI18n"

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { language, t, toggleLanguage } = useI18n()
  const targetLanguage = language === "en" ? "ar" : "en"

  return (
    <button className={`language-switcher${className ? ` ${className}` : ""}`} type="button" onClick={toggleLanguage} aria-label={t("language.switch")}>
      <span lang={targetLanguage} dir={targetLanguage === "ar" ? "rtl" : "ltr"}>{t("language.switchTo")}</span>
    </button>
  )
}
