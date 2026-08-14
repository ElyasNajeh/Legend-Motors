import { Icon } from "@/shared/components/Icon"
import { useI18n } from "@/localization/useI18n"

type SliderFiltersProps = {
  search: string
  status: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
}

export function SliderFilters(props: SliderFiltersProps) {
  const { t } = useI18n()
  return (
    <div className="filters filters--sliders">
      <label className="search-field">
        <span><Icon name="search" /></span>
        <input
          aria-label={t("admin.management.searchSliders")}
          placeholder={t("admin.management.searchSliders")}
          value={props.search}
          onChange={(event) => props.onSearchChange(event.target.value)}
        />
      </label>
      <select
        aria-label={t("admin.management.filterStatus")}
        value={props.status}
        onChange={(event) => props.onStatusChange(event.target.value)}
      >
        <option value="">{t("admin.management.allStatuses")}</option>
        <option value="true">{t("admin.common.active")}</option>
        <option value="false">{t("admin.common.hidden")}</option>
      </select>
    </div>
  )
}
