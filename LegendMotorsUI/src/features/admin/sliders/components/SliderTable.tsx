import { EmptyState, LoadableContent } from "@/shared/components/AdminComponents"
import type { Slider } from "../sliders.types"
import { SliderTableRow } from "./SliderTableRow"
import { useI18n } from "@/localization/useI18n"

type SliderTableProps = {
  items: Slider[]
  loading: boolean
  error: string
  onCreate: () => void
  onEdit: (slider: Slider) => void
  onToggle: (slider: Slider) => void
  onDelete: (slider: Slider) => void
  onRetry: () => void
}

export function SliderTable(props: SliderTableProps) {
  const { t } = useI18n()
  return (
    <LoadableContent loading={props.loading} loadingMessage={t("admin.management.loadingSliders")} error={props.error} onRetry={props.onRetry}>
      {props.items.length === 0 ? (
        <EmptyState
          title={t("admin.management.noSliders")}
          message={t("admin.management.noSlidersMessage")}
          action={<button className="button" onClick={props.onCreate}>{t("admin.pages.addSlider")}</button>}
        />
      ) : (
        <div className="table-card">
          <div className="product-table product-table--head slider-table">
            <span>{t("admin.management.slider")}</span><span>{t("admin.management.order")}</span><span>{t("admin.management.created")}</span><span>{t("admin.management.status")}</span><span>{t("admin.management.actions")}</span>
          </div>
          {props.items.map((slider) => (
            <SliderTableRow
              key={slider.id}
              slider={slider}
              onEdit={props.onEdit}
              onToggle={props.onToggle}
              onDelete={props.onDelete}
            />
          ))}
        </div>
      )}
    </LoadableContent>
  )
}
