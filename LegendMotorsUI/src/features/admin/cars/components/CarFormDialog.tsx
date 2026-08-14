import { useRef, useState, type FormEvent } from "react"
import type { Brand } from "@/features/admin/brands/brands.types"
import { getLocalizedErrorMessage } from "@/shared/api/error"
import { Icon } from "@/shared/components/Icon"
import { useI18n } from "@/localization/useI18n"
import type { Car, CarFormValues, CarPayload } from "../cars.types"

type Errors = Partial<Record<keyof CarFormValues, string>>

function initialValues(car: Car | null, brands: Brand[]): CarFormValues {
  return {
    brand_id: String(car?.brand_id ?? brands[0]?.id ?? ""),
    model: car?.model ?? "",
    year: car ? String(car.year) : "",
    mileage: car ? String(car.mileage) : "",
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

function validate(form: CarFormValues, requiredMessage: string, integerMessage: string) {
  const errors: Errors = {}
  const required: Array<keyof CarFormValues> = ["brand_id", "model", "year", "mileage", "horsepower", "fuel_type", "engine_cc"]
  required.forEach((field) => { if (!String(form[field]).trim()) errors[field] = requiredMessage })
  ;(["year", "mileage", "horsepower", "engine_cc"] as const).forEach((field) => {
    if (form[field] && !Number.isInteger(Number(form[field]))) errors[field] = integerMessage
  })
  return errors
}

function toPayload(form: CarFormValues): CarPayload {
  return {
    brand_id: Number(form.brand_id), model: form.model.trim(), year: Number(form.year), mileage: Number(form.mileage),
    horsepower: Number(form.horsepower), fuel_type: form.fuel_type.trim(), engine_cc: Number(form.engine_cc),
    is_turbo: form.is_turbo, description_ar: form.description_ar.trim() || null, description_en: form.description_en.trim() || null,
    is_featured: form.is_featured, car_type: form.car_type,
    hybrid_details: form.car_type === "hybrid" ? { battery_capacity: form.battery_capacity.trim() || null } : null,
  }
}

export function CarFormDialog({ car, brands, onClose, onSave }: { car: Car | null; brands: Brand[]; onClose: () => void; onSave: (car: Car | null, payload: CarPayload, files: File[]) => Promise<void> }) {
  const { t, direction, language } = useI18n()
  const [form, setForm] = useState(() => initialValues(car, brands))
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const change = <K extends keyof CarFormValues>(key: K, value: CarFormValues[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }
  const fieldError = (key: keyof CarFormValues) => errors[key] ? <small className="field-error">{errors[key]}</small> : null

  async function submit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = validate(form, t("admin.validation.requiredField"), t("admin.validation.wholeNumber"))
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return }
    setSaving(true); setFormError("")
    try { await onSave(car, toPayload(form), files); onClose() }
    catch (error) { setFormError(getLocalizedErrorMessage(error, language, t("admin.validation.saveFailed"))) }
    finally { setSaving(false) }
  }

  return (
    <div className="dialog-backdrop">
      <form className="form-dialog form-dialog--wide" dir={direction} lang={language} noValidate onSubmit={(event) => void submit(event)}>
        <div className="form-dialog__header"><div><span>{t("admin.forms.car.eyebrow")}</span><h2>{t(car ? "admin.forms.car.editTitle" : "admin.forms.car.newTitle")}</h2></div><button type="button" aria-label={t("admin.forms.common.close")} onClick={onClose}><Icon name="close" /></button></div>
        <fieldset className="form-section"><legend>{t("admin.forms.car.sections.type")}</legend>
          <div className="choice-cards">
            <label className={form.car_type === "normal" ? "selected" : ""}><input type="radio" checked={form.car_type === "normal"} onChange={() => change("car_type", "normal")} /><Icon name="cars" /><span><strong>{t("admin.carTypes.normal")}</strong><small>{t("admin.forms.car.normalHelp")}</small></span></label>
            <label className={form.car_type === "hybrid" ? "selected" : ""}><input type="radio" checked={form.car_type === "hybrid"} onChange={() => change("car_type", "hybrid")} /><Icon name="hybrid" /><span><strong>{t("admin.carTypes.hybrid")}</strong><small>{t("admin.forms.car.hybridHelp")}</small></span></label>
          </div>
        </fieldset>
        <fieldset className="form-section"><legend>{t("admin.forms.car.sections.basic")}</legend><div className="form-grid">
          <label>{t("admin.fields.brand")}<select value={form.brand_id} onChange={(e) => change("brand_id", e.target.value)} required><option value="">{t("admin.forms.car.chooseBrand")}</option>{brands.map((brand) => <option key={brand.id} value={brand.id}>{language === "ar" ? brand.name_ar : brand.name_en}</option>)}</select>{fieldError("brand_id")}</label>
          <label>{t("admin.fields.model")}<input value={form.model} maxLength={255} onChange={(e) => change("model", e.target.value)} required />{fieldError("model")}</label>
          <NumberField label={t("admin.fields.year")} value={form.year} error={errors.year} onChange={(value) => change("year", value)} />
          <NumberField label={t("admin.fields.mileage")} value={form.mileage} error={errors.mileage} onChange={(value) => change("mileage", value)} />
          <NumberField label={t("admin.fields.horsepower")} value={form.horsepower} error={errors.horsepower} onChange={(value) => change("horsepower", value)} />
          <NumberField label={t("admin.fields.engineCc")} value={form.engine_cc} error={errors.engine_cc} onChange={(value) => change("engine_cc", value)} />
          <label>{t("admin.fields.fuelType")}<input value={form.fuel_type} maxLength={20} onChange={(e) => change("fuel_type", e.target.value)} required />{fieldError("fuel_type")}</label>
          {form.car_type === "hybrid" && <label>{t("admin.fields.batteryCapacity")}<input value={form.battery_capacity} maxLength={50} onChange={(e) => change("battery_capacity", e.target.value)} /><small>{t("admin.common.optional")}</small></label>}
        </div></fieldset>
        <fieldset className="form-section"><legend>{t("admin.forms.car.sections.descriptions")}</legend><div className="form-grid">
          <label>{t("admin.fields.englishDescription")}<textarea dir="ltr" value={form.description_en} onChange={(e) => change("description_en", e.target.value)} /><small>{t("admin.common.optional")}</small></label>
          <label>{t("admin.fields.arabicDescription")}<textarea dir="rtl" value={form.description_ar} onChange={(e) => change("description_ar", e.target.value)} /><small>{t("admin.common.optional")}</small></label>
        </div></fieldset>
        <fieldset className="form-section"><legend>{t("admin.forms.car.sections.images")}</legend>
          <div className="image-upload">
            <div className="image-upload__preview"><Icon name="cars" size={36} /></div>
            <div>
              <input ref={imageInputRef} hidden type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []))} />
              <button className="button button--secondary" type="button" disabled={saving} onClick={() => imageInputRef.current?.click()}>{t("admin.forms.car.chooseImages")}</button>
              <small>{files.length ? t("admin.forms.car.imagesSelected", { count: files.length }) : t("admin.forms.car.imagesHelp")}</small>
            </div>
          </div>
        </fieldset>
        <fieldset className="form-section"><legend>{t("admin.forms.car.sections.options")}</legend><div className="car-switches">
          <label className="switch-row"><span><strong>{t("admin.fields.turbo")}</strong></span><input type="checkbox" checked={form.is_turbo} onChange={(e) => change("is_turbo", e.target.checked)} /></label>
          <label className="switch-row"><span><strong>{t("admin.fields.featured")}</strong><small>{t("admin.forms.car.featuredHelp")}</small></span><input type="checkbox" checked={form.is_featured} onChange={(e) => change("is_featured", e.target.checked)} /></label>
        </div></fieldset>
        {formError && <p className="form-error">{formError}</p>}
        <div className="form-actions"><button type="button" className="button button--ghost" disabled={saving} onClick={onClose}>{t("admin.forms.common.cancel")}</button><button className="button" disabled={saving}>{saving ? t("admin.forms.common.saving") : t("admin.forms.car.save")}</button></div>
      </form>
    </div>
  )
}

function NumberField({ label, value, error, onChange }: { label: string; value: string; error?: string; onChange: (value: string) => void }) {
  return <label>{label}<input type="number" step="1" value={value} onChange={(event) => onChange(event.target.value)} required />{error && <small className="field-error">{error}</small>}</label>
}
