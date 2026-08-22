import { FilterSearch, FilterSelect } from "@/shared/components/DashboardFilters"
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
      <FilterSearch
        label={t("admin.management.searchSliders")}
        placeholder={t("admin.management.searchSliders")}
        value={props.search}
        onValueChange={props.onSearchChange}
      />
      <FilterSelect
        label={t("admin.management.filterStatus")}
        value={props.status}
        onValueChange={props.onStatusChange}
      >
        <option value="">{t("admin.management.allStatuses")}</option>
        <option value="true">{t("admin.common.active")}</option>
        <option value="false">{t("admin.common.hidden")}</option>
      </FilterSelect>
    </div>
  )
}
