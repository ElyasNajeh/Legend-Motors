import { useState, type FormEvent } from "react"
import { getLocalizedErrorMessage } from "@/shared/api/error"
import {
  ImageUpload,
  RequiredMark,
} from "@/shared/components/AdminComponents"
import { Icon } from "@/shared/components/Icon"
import { useI18n } from "@/localization/useI18n"
import { SlidersApi } from "../sliders.api"
import type { Slider, SliderFormValues, SliderPayload } from "../sliders.types"

type SliderFormDialogProps = {
  slider: Slider | null
  nextDisplayOrder: number | null
  onClose: () => void
  onSave: (
    slider: Slider | null,
    payload: SliderPayload,
    isActive: boolean,
  ) => Promise<void>
}

function createInitialForm(slider: Slider | null): SliderFormValues {
  return {
    title_ar: slider?.title_ar ?? "",
    title_en: slider?.title_en ?? "",
    display_order: slider ? String(slider.display_order) : "",
    is_active: slider?.is_active ?? true,
    image: slider?.image ?? "",
  }
}

export function SliderFormDialog(props: SliderFormDialogProps) {
  const { t, direction, language } = useI18n()
  const [form, setForm] = useState(() => createInitialForm(props.slider))
  const [saving, setSaving] = useState(false)
  const [processingImage, setProcessingImage] = useState(false)
  const [displayOrderEdited, setDisplayOrderEdited] = useState(false)
  const [formError, setFormError] = useState("")
  const displayOrderValue =
    props.slider || displayOrderEdited
      ? form.display_order
      : props.nextDisplayOrder === null
        ? ""
        : String(props.nextDisplayOrder)

  async function handleSave(event: FormEvent) {
    event.preventDefault()

    if (!form.title_ar.trim() || !form.title_en.trim() || !form.image) {
      setFormError(t("admin.forms.slider.validation.required"))
      return
    }

    const displayOrder = Number(displayOrderValue)
    if (
      !Number.isInteger(displayOrder) ||
      displayOrder < 0 ||
      displayOrderValue === ""
    ) {
      setFormError(t("admin.forms.slider.validation.displayOrder"))
      return
    }

    setSaving(true)
    setFormError("")

    try {
      await props.onSave(
        props.slider,
        {
          title_ar: form.title_ar,
          title_en: form.title_en,
          display_order: displayOrder,
          image: form.image,
        },
        form.is_active,
      )
      props.onClose()
    } catch (caught) {
      setFormError(
        getLocalizedErrorMessage(
          caught,
          language,
          t("admin.forms.slider.validation.saveFailed"),
        ),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="dialog-backdrop">
      <form
        className="form-dialog form-dialog--wide"
        dir={direction}
        lang={language}
        noValidate
        onSubmit={(event) => void handleSave(event)}
      >
        <div className="form-dialog__header">
          <div>
            <span>{t("admin.forms.slider.eyebrow")}</span>
            <h2>
              {t(
                props.slider
                  ? "admin.forms.slider.editTitle"
                  : "admin.forms.slider.newTitle",
              )}
            </h2>
          </div>
          <button
            type="button"
            aria-label={t("admin.forms.common.close")}
            disabled={saving || processingImage}
            onClick={props.onClose}
          >
            <Icon name="close" />
          </button>
        </div>

        <fieldset className="form-section">
          <legend>{t("admin.forms.slider.sections.info")}</legend>
          <div className="form-grid">
            <label>
              <span>
                {t("admin.forms.fields.englishTitle")} <RequiredMark />
              </span>
              <input
                dir="ltr"
                value={form.title_en}
                maxLength={255}
                onChange={(event) =>
                  setForm({ ...form, title_en: event.target.value })
                }
                disabled={saving}
                required
              />
            </label>
            <label>
              <span>
                {t("admin.forms.fields.arabicTitle")} <RequiredMark />
              </span>
              <input
                dir="rtl"
                value={form.title_ar}
                maxLength={255}
                onChange={(event) =>
                  setForm({ ...form, title_ar: event.target.value })
                }
                disabled={saving}
                required
              />
            </label>
          </div>
          <label className="field-label slider-order-field">
            <span>
              {t("admin.forms.slider.displayOrder")} <RequiredMark />
            </span>
            <input
              type="number"
              min="0"
              step="1"
              value={displayOrderValue}
              onChange={(event) => {
                setDisplayOrderEdited(true)
                setForm({
                  ...form,
                  display_order: event.target.value,
                })
              }}
              disabled={saving}
              required
            />
            <small>{t("admin.forms.slider.displayOrderHelp")}</small>
          </label>
        </fieldset>

        <fieldset className="form-section">
          <legend>
            {t("admin.forms.slider.sections.image")} <RequiredMark />
          </legend>
          <div className="slider-image-upload">
            <ImageUpload
              value={form.image}
              onChange={(image) => setForm({ ...form, image })}
              upload={SlidersApi.upload}
              disabled={saving}
              busyLabel={t("admin.forms.slider.processingImage")}
              helpText={t("admin.forms.slider.imageHelp")}
              onBusyChange={setProcessingImage}
            />
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>{t("admin.forms.common.sections.status")}</legend>
          <label className="switch-row">
            <span>
              <strong>{t("admin.forms.slider.activeLabel")}</strong>
              <small>{t("admin.forms.slider.activeHelp")}</small>
            </span>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) =>
                setForm({ ...form, is_active: event.target.checked })
              }
              disabled={saving}
            />
          </label>
        </fieldset>

        {formError && <p className="form-error">{formError}</p>}
        <div className="form-actions">
          <button
            type="button"
            className="button button--ghost"
            disabled={saving || processingImage}
            onClick={props.onClose}
          >
            {t("admin.forms.common.cancel")}
          </button>
          <button className="button" disabled={saving || processingImage}>
            {processingImage
              ? t("admin.forms.slider.processingImage")
              : saving
                ? t("admin.forms.common.saving")
                : t("admin.forms.slider.save")}
          </button>
        </div>
      </form>
    </div>
  )
}
