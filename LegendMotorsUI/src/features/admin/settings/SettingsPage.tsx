import { useState } from "react"
import { PageHeader } from "@/shared/components/AdminComponents"
import { Icon } from "@/shared/components/Icon"
import { applyTheme, getInitialTheme, type Theme } from "@/shared/theme"
import { useI18n } from "@/localization/useI18n"

const THEMES = [
  { nameKey: "admin.pages.light", icon: "sun" as const, descriptionKey: "admin.pages.lightDescription", value: "light" as const },
  { nameKey: "admin.pages.dark", icon: "moon" as const, descriptionKey: "admin.pages.darkDescription", value: "dark" as const },
]

export function SettingsPage() {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(getInitialTheme)
  const { t } = useI18n()
  function selectTheme(theme: Theme) { setSelectedTheme(theme); applyTheme(theme) }
  return <section>
    <PageHeader eyebrow={t("admin.pages.settingsEyebrow")} icon="settings" title={t("admin.settings")} description={t("admin.pages.settingsDescription")} />
    <div className="settings-grid"><article className="settings-card appearance-card"><div className="settings-card__title"><span><Icon name="settings" /></span><div><h2>{t("admin.pages.appearance")}</h2><p>{t("admin.pages.appearanceDescription")}</p></div></div><div className="appearance-options" role="radiogroup" aria-label={t("admin.pages.appearanceThemes")}>
      {THEMES.map((theme) => { const selected = selectedTheme === theme.value; return <label className={`appearance-option appearance-option--${theme.value}${selected ? " selected" : ""}`} key={theme.nameKey}><input type="radio" name="appearance-theme" checked={selected} onChange={() => selectTheme(theme.value)} /><span className="appearance-option__icon"><Icon name={theme.icon} size={30} /></span><strong>{t(theme.nameKey)}</strong><small>{t(theme.descriptionKey)}</small><em>{t(selected ? "admin.common.active" : "admin.pages.select")}</em></label> })}
    </div></article></div>
  </section>
}
