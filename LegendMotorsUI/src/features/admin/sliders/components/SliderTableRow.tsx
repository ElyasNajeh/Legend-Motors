import { getAssetUrl } from "@/shared/api/assets"
import { StatusBadge } from "@/shared/components/AdminComponents"
import { Icon } from "@/shared/components/Icon"
import type { Slider } from "../sliders.types"
import { useI18n } from "@/localization/useI18n"
import { localizedPair } from "@/localization/localizedContent"

type SliderTableRowProps = {
  slider: Slider
  onEdit: (slider: Slider) => void
  onToggle: (slider: Slider) => void
  onDelete: (slider: Slider) => void
}

export function SliderTableRow(props: SliderTableRowProps) {
  const { slider } = props
  const { language, t } = useI18n()
  const title = localizedPair(slider.title_en, slider.title_ar, language)

  return (
    <article className="product-table slider-table">
      <div className="product-cell slider-cell">
        <img src={getAssetUrl(slider.image)} alt="" />
        <span>
          <strong lang={title.primaryLanguage}>{title.primary}</strong>
          <small lang={title.secondaryLanguage}>{title.secondary}</small>
        </span>
      </div>
      <span>{slider.display_order}</span>
      <span>{new Date(slider.created_at).toLocaleDateString(language === "ar" ? "ar-PS" : "en-PS")}</span>
      <StatusBadge active={slider.is_active} />
      <div className="row-actions">
        <button className="icon-button" title={t("admin.management.edit")} onClick={() => props.onEdit(slider)}>
          <Icon name="edit" />
        </button>
        <button
          className="icon-button"
          title={t(slider.is_active ? "admin.management.hide" : "admin.management.activate")}
          onClick={() => props.onToggle(slider)}
        >
          <Icon name={slider.is_active ? "eyeOff" : "eye"} />
        </button>
        <button
          className="icon-button icon-button--danger"
          title={t("admin.management.delete")}
          onClick={() => props.onDelete(slider)}
        >
          <Icon name="trash" />
        </button>
      </div>
    </article>
  )
}
