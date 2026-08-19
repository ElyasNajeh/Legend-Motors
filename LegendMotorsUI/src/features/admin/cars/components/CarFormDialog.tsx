import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react"
import type { Brand } from "@/features/admin/brands/brands.types"
import { getAssetUrl } from "@/shared/api/assets"
import { getLocalizedErrorMessage } from "@/shared/api/error"
import { RequiredMark } from "@/shared/components/AdminComponents"
import { Icon } from "@/shared/components/Icon"
import { useI18n } from "@/localization/useI18n"
import type {
  Car,
  CarFormValues,
  CarImageSelection,
  CarPayload,
} from "../cars.types"

type Errors = Partial<Record<keyof CarFormValues, string>>

type ManagedImage =
  | {
      key: string
      kind: "existing"
      id: number
      previewUrl: string
    }
  | {
      key: string
      kind: "new"
      file: File
      previewUrl: string
    }

function initialImages(car: Car | null): ManagedImage[] {
  return (car?.images ?? []).map((image) => ({
    key: `existing-${image.id}`,
    kind: "existing",
    id: image.id,
    previewUrl: getAssetUrl(image.image),
  }))
}

function initialValues(
  car: Car | null,
  brands: Brand[],
): CarFormValues {
  return {
    brand_id: String(car?.brand_id ?? brands[0]?.id ?? ""),
    model: car?.model ?? "",
    year: car ? String(car.year) : "",
    mileage: car ? String(car.mileage) : "",
    transmission: car?.transmission ?? "automatic",
    horsepower: car ? String(car.horsepower) : "",
    fuel_type: car?.fuel_type ?? "",
    engine_cc: car ? String(car.engine_cc) : "",
    is_turbo: car?.is_turbo ?? false,
    description_ar: car?.description_ar ?? "",
    description_en: car?.description_en ?? "",
    is_featured: car?.is_featured ?? false,
    car_type: car?.car_type ?? "normal",
    battery_capacity: car?.hybrid_car?.battery_capacity ?? "",
  }
}

function validate(
  form: CarFormValues,
  requiredMessage: string,
  integerMessage: string,
) {
  const errors: Errors = {}

  const required: Array<keyof CarFormValues> = [
    "brand_id",
    "model",
    "year",
    "mileage",
    "transmission",
    "horsepower",
    "fuel_type",
    "engine_cc",
  ]

  required.forEach((field) => {
    if (!String(form[field]).trim()) {
      errors[field] = requiredMessage
    }
  })

  ;(["year", "mileage", "horsepower", "engine_cc"] as const).forEach(
    (field) => {
      if (
        form[field] &&
        !Number.isInteger(Number(form[field]))
      ) {
        errors[field] = integerMessage
      }
    },
  )

  return errors
}

function toPayload(form: CarFormValues): CarPayload {
  return {
    brand_id: Number(form.brand_id),
    model: form.model.trim(),
    year: Number(form.year),
    mileage: Number(form.mileage),
    transmission: form.transmission,
    horsepower: Number(form.horsepower),
    fuel_type: form.fuel_type.trim(),
    engine_cc: Number(form.engine_cc),
    is_turbo: form.is_turbo,
    description_ar: form.description_ar.trim() || null,
    description_en: form.description_en.trim() || null,
    is_featured: form.is_featured,
    car_type: form.car_type,
    hybrid_details:
      form.car_type === "hybrid"
        ? {
            battery_capacity:
              form.battery_capacity.trim() || null,
          }
        : null,
  }
}

export function CarFormDialog({
  car,
  brands,
  onClose,
  onSave,
}: {
  car: Car | null
  brands: Brand[]
  onClose: () => void
  onSave: (
    car: Car | null,
    payload: CarPayload,
    images: CarImageSelection,
  ) => Promise<void>
}) {
  const { t, direction, language } = useI18n()
  const [form, setForm] = useState(() => initialValues(car, brands))
  const [images, setImages] = useState<ManagedImage[]>(() =>
    initialImages(car),
  )
  const [primaryImageKey, setPrimaryImageKey] = useState<
    string | null
  >(() => {
    const primary =
      car?.images.find((image) => image.is_primary) ??
      car?.images[0]

    return primary ? `existing-${primary.id}` : null
  })
  const [deletedExistingImageIds, setDeletedExistingImageIds] =
    useState<number[]>([])
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const previewUrlsRef = useRef(new Set<string>())

  useEffect(
    () => () => {
      previewUrlsRef.current.forEach((url) =>
        URL.revokeObjectURL(url),
      )
      previewUrlsRef.current.clear()
    },
    [],
  )

  const change = <K extends keyof CarFormValues>(
    key: K,
    value: CarFormValues[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
    setFormError("")
  }

  const fieldError = (key: keyof CarFormValues) =>
    errors[key] ? (
      <small className="field-error">{errors[key]}</small>
    ) : null

  function selectImages(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []).map(
      (file) => {
        const previewUrl = URL.createObjectURL(file)
        previewUrlsRef.current.add(previewUrl)

        return {
          key: `new-${crypto.randomUUID()}`,
          kind: "new" as const,
          file,
          previewUrl,
        }
      },
    )

    if (selected.length) {
      setImages((current) => [...current, ...selected])
      setPrimaryImageKey((current) => current ?? selected[0].key)
      setFormError("")
    }

    event.target.value = ""
  }

  function removeImage(key: string) {
    const image = images.find((item) => item.key === key)

    if (!image) return

    if (image.kind === "new") {
      URL.revokeObjectURL(image.previewUrl)
      previewUrlsRef.current.delete(image.previewUrl)
    } else {
      setDeletedExistingImageIds((current) => [
        ...current,
        image.id,
      ])
    }

    const remaining = images.filter((item) => item.key !== key)

    setImages(remaining)

    if (primaryImageKey === key) {
      setPrimaryImageKey(remaining[0]?.key ?? null)
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()

    const nextErrors = validate(
      form,
      t("admin.validation.requiredField"),
      t("admin.validation.wholeNumber"),
    )

    if (Object.keys(nextErrors).length || images.length === 0) {
      setErrors(nextErrors)
      setFormError(
        images.length === 0
          ? t("admin.forms.car.validation.imageRequired")
          : t("admin.validation.reviewFields"),
      )
      return
    }

    setSaving(true)
    setFormError("")

    const selectedPrimary = images.find(
      (image) => image.key === primaryImageKey,
    )

    const imageSelection: CarImageSelection = {
      files: images
        .filter(
          (
            image,
          ): image is Extract<
            ManagedImage,
            { kind: "new" }
          > => image.kind === "new",
        )
        .map((image) => ({
          file: image.file,
          isPrimary: image.key === primaryImageKey,
        })),
      primaryExistingImageId:
        selectedPrimary?.kind === "existing"
          ? selectedPrimary.id
          : null,
      deletedExistingImageIds,
    }

    try {
      await onSave(car, toPayload(form), imageSelection)
      onClose()
    } catch (error) {
      setFormError(
        getLocalizedErrorMessage(
          error,
          language,
          t(
            car
              ? "admin.feedback.cars.updateSaveFailedMessage"
              : "admin.feedback.cars.createFailedMessage",
          ),
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
        onSubmit={(event) => void submit(event)}
      >
        <div className="form-dialog__header">
          <div>
            <span>{t("admin.forms.car.eyebrow")}</span>

            <h2>
              {t(
                car
                  ? "admin.forms.car.editTitle"
                  : "admin.forms.car.newTitle",
              )}
            </h2>
          </div>

          <button
            type="button"
            aria-label={t("admin.forms.common.close")}
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>

        <fieldset className="form-section">
          <legend>{t("admin.forms.car.sections.type")}</legend>

          <div className="choice-cards">
            <label
              className={
                form.car_type === "normal" ? "selected" : ""
              }
            >
              <input
                type="radio"
                checked={form.car_type === "normal"}
                onChange={() => change("car_type", "normal")}
              />

              <Icon name="cars" />

              <span>
                <strong>{t("admin.carTypes.normal")}</strong>
                <small>{t("admin.forms.car.normalHelp")}</small>
              </span>
            </label>

            <label
              className={
                form.car_type === "hybrid" ? "selected" : ""
              }
            >
              <input
                type="radio"
                checked={form.car_type === "hybrid"}
                onChange={() => change("car_type", "hybrid")}
              />

              <Icon name="hybrid" />

              <span>
                <strong>{t("admin.carTypes.hybrid")}</strong>
                <small>{t("admin.forms.car.hybridHelp")}</small>
              </span>
            </label>
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>{t("admin.forms.car.sections.basic")}</legend>

          <div className="form-grid">
            <label>
              <span>
                {t("admin.fields.brand")} <RequiredMark />
              </span>

              <select
                value={form.brand_id}
                onChange={(e) =>
                  change("brand_id", e.target.value)
                }
                required
              >
                <option value="">
                  {t("admin.forms.car.chooseBrand")}
                </option>

                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {language === "ar"
                      ? brand.name_ar
                      : brand.name_en}
                  </option>
                ))}
              </select>

              {fieldError("brand_id")}
            </label>

            <label>
              <span>
                {t("admin.fields.model")} <RequiredMark />
              </span>

              <input
                value={form.model}
                maxLength={255}
                onChange={(e) => change("model", e.target.value)}
                required
              />

              {fieldError("model")}
            </label>

            <NumberField
              label={t("admin.fields.year")}
              value={form.year}
              error={errors.year}
              onChange={(value) => change("year", value)}
            />

            <NumberField
              label={t("admin.fields.mileage")}
              value={form.mileage}
              error={errors.mileage}
              onChange={(value) => change("mileage", value)}
            />

            <label>
              <span>
                {t("admin.fields.transmission")} <RequiredMark />
              </span>

              <select
                value={form.transmission}
                onChange={(e) =>
                  change(
                    "transmission",
                    e.target
                      .value as CarFormValues["transmission"],
                  )
                }
                required
              >
                <option value="automatic">
                  {t("admin.transmissions.automatic")}
                </option>
                <option value="manual">
                  {t("admin.transmissions.manual")}
                </option>
                <option value="cvt">
                  {t("admin.transmissions.cvt")}
                </option>
              </select>

              {fieldError("transmission")}
            </label>

            <NumberField
              label={t("admin.fields.horsepower")}
              value={form.horsepower}
              error={errors.horsepower}
              onChange={(value) => change("horsepower", value)}
            />

            <NumberField
              label={t("admin.fields.engineCc")}
              value={form.engine_cc}
              error={errors.engine_cc}
              onChange={(value) => change("engine_cc", value)}
            />

            <label>
              <span>
                {t("admin.fields.fuelType")} <RequiredMark />
              </span>

              <input
                value={form.fuel_type}
                maxLength={20}
                onChange={(e) =>
                  change("fuel_type", e.target.value)
                }
                required
              />

              {fieldError("fuel_type")}
            </label>

            {form.car_type === "hybrid" && (
              <label>
                {t("admin.fields.batteryCapacity")}

                <input
                  value={form.battery_capacity}
                  maxLength={50}
                  onChange={(e) =>
                    change("battery_capacity", e.target.value)
                  }
                />

                <small>{t("admin.common.optional")}</small>
              </label>
            )}
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>
            {t("admin.forms.car.sections.descriptions")}
          </legend>

          <div className="form-grid">
            <label>
              {t("admin.fields.englishDescription")}

              <textarea
                dir="ltr"
                value={form.description_en}
                onChange={(e) =>
                  change("description_en", e.target.value)
                }
              />

              <small>{t("admin.common.optional")}</small>
            </label>

            <label>
              {t("admin.fields.arabicDescription")}

              <textarea
                dir="rtl"
                value={form.description_ar}
                onChange={(e) =>
                  change("description_ar", e.target.value)
                }
              />

              <small>{t("admin.common.optional")}</small>
            </label>
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>
            {t("admin.forms.car.sections.images")} <RequiredMark />
          </legend>

          <div className="car-image-manager">
            <div className="car-image-manager__picker">
              <span className="car-image-manager__picker-icon">
                <Icon name="cars" size={28} />
              </span>

              <div>
                <input
                  ref={imageInputRef}
                  hidden
                  type="file"
                  multiple
                  onChange={selectImages}
                />

                <button
                  className="button button--secondary"
                  type="button"
                  disabled={saving}
                  onClick={() => imageInputRef.current?.click()}
                >
                  {t(
                    images.length
                      ? "admin.forms.car.addMoreImages"
                      : "admin.forms.car.chooseImages",
                  )}
                </button>

                <small id="car-images-help">
                  {images.length
                    ? t("admin.forms.car.imagesSelected", {
                        count: images.length,
                      })
                    : t("admin.forms.car.imagesHelp")}
                </small>
              </div>
            </div>

            {images.length > 0 && (
              <div
                className="car-image-grid"
                role="radiogroup"
                aria-label={t(
                  "admin.forms.car.choosePrimaryImage",
                )}
              >
                {images.map((image, index) => {
                  const isPrimary =
                    image.key === primaryImageKey

                  return (
                    <article
                      className={`car-image-card${
                        isPrimary ? " is-primary" : ""
                      }`}
                      key={image.key}
                    >
                      <div className="car-image-card__preview">
                        <img
                          src={image.previewUrl}
                          alt={t(
                            "admin.forms.car.imagePreview",
                            {
                              number: index + 1,
                            },
                          )}
                          loading="lazy"
                          decoding="async"
                        />

                        <span>
                          {t(
                            isPrimary
                              ? "admin.forms.car.primaryImage"
                              : "admin.forms.car.secondaryImage",
                          )}
                        </span>

                        <button
                          type="button"
                          disabled={saving}
                          aria-label={t(
                            "admin.forms.car.removeImage",
                          )}
                          title={t(
                            "admin.forms.car.removeImage",
                          )}
                          onClick={() => removeImage(image.key)}
                        >
                          <Icon name="close" size={16} />
                        </button>
                      </div>

                      <label className="car-image-card__choice">
                        <input
                          type="radio"
                          name="primary-car-image"
                          checked={isPrimary}
                          disabled={saving}
                          onChange={() =>
                            setPrimaryImageKey(image.key)
                          }
                        />

                        <span>
                          <strong>
                            {t(
                              isPrimary
                                ? "admin.forms.car.primaryImage"
                                : "admin.forms.car.makePrimary",
                            )}
                          </strong>

                          <small>
                            {t(
                              isPrimary
                                ? "admin.forms.car.primaryImageHelp"
                                : "admin.forms.car.secondaryImageHelp",
                            )}
                          </small>
                        </span>
                      </label>
                    </article>
                  )
                })}
              </div>
            )}

            {deletedExistingImageIds.length > 0 && (
              <small className="car-image-manager__pending">
                {t("admin.forms.car.imagesPendingDeletion", {
                  count: deletedExistingImageIds.length,
                })}
              </small>
            )}
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>{t("admin.forms.car.sections.options")}</legend>

          <div className="car-switches">
            <label className="switch-row">
              <span>
                <strong>{t("admin.fields.turbo")}</strong>
              </span>

              <input
                type="checkbox"
                checked={form.is_turbo}
                onChange={(e) =>
                  change("is_turbo", e.target.checked)
                }
              />
            </label>

            <label className="switch-row">
              <span>
                <strong>{t("admin.fields.featured")}</strong>
                <small>
                  {t("admin.forms.car.featuredHelp")}
                </small>
              </span>

              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) =>
                  change("is_featured", e.target.checked)
                }
              />
            </label>
          </div>
        </fieldset>

        {formError && <p className="form-error">{formError}</p>}

        <div className="form-actions">
          <button
            type="button"
            className="button button--ghost"
            disabled={saving}
            onClick={onClose}
          >
            {t("admin.forms.common.cancel")}
          </button>

          <button
            className={`button${
              images.length === 0 ? " is-image-required" : ""
            }`}
            disabled={saving || images.length === 0}
            aria-describedby={
              images.length === 0
                ? "car-images-help"
                : undefined
            }
          >
            {saving
              ? t("admin.forms.common.saving")
              : t("admin.forms.car.save")}
          </button>
        </div>
      </form>
    </div>
  )
}

function NumberField({
  label,
  value,
  error,
  onChange,
}: {
  label: string
  value: string
  error?: string
  onChange: (value: string) => void
}) {
  return (
    <label>
      <span>
        {label} <RequiredMark />
      </span>

      <input
        type="number"
        step="1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
      />

      {error && <small className="field-error">{error}</small>}
    </label>
  )
}
