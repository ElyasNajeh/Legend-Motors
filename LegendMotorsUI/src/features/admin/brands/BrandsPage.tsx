import { useMemo, useState, type FormEvent } from "react"
import { queryKeys, useMutation, useQuery } from "@/shared/query/remoteData"
import { getLocalizedErrorMessage } from "@/shared/api/error"
import { EmptyState, LoadableContent, PageHeader, Pagination } from "@/shared/components/AdminComponents"
import { Icon } from "@/shared/components/Icon"
import { useFeedback } from "@/shared/feedback/FeedbackProvider"
import { useI18n } from "@/localization/useI18n"
import { BrandsApi } from "./brands.api"
import type { Brand, BrandPayload } from "./brands.types"

const PAGE_SIZE = 8
type EditingBrand = Brand | null | undefined

export function BrandsPage() {
  const { t, language } = useI18n()
  const { toast, confirm } = useFeedback()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<EditingBrand>(() => new URLSearchParams(location.search).has("new") ? null : undefined)
  const query = useQuery({ queryKey: queryKeys.brands, queryFn: BrandsApi.list })
  const saveMutation = useMutation({
    mutationFn: ({ brand, payload }: { brand: Brand | null; payload: BrandPayload }) => brand ? BrandsApi.update(brand.id, payload) : BrandsApi.create(payload),
    onSuccess: async (_, { brand, payload }) => {
      toast.success(t(brand ? "admin.feedback.brands.updated" : "admin.feedback.brands.created"), t("admin.feedback.brands.saved", { name: language === "ar" ? payload.name_ar : payload.name_en }))
      await query.refetch()
    },
  })
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()
    return (query.data ?? []).filter((brand) => !term || brand.name_en.toLocaleLowerCase().includes(term) || brand.name_ar.toLocaleLowerCase().includes(term))
  }, [query.data, search])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const items = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  async function deleteBrand(brand: Brand) {
    const name = language === "ar" ? brand.name_ar : brand.name_en
    if (!await confirm({ title: t("admin.feedback.brands.deleteTitle"), message: t("admin.feedback.brands.deleteMessage", { name }), confirmLabel: t("admin.feedback.brands.deleteConfirm"), variant: "danger" })) return
    try {
      await BrandsApi.delete(brand.id)
      toast.success(t("admin.feedback.brands.deleted"), t("admin.feedback.brands.removed", { name }))
      await query.refetch()
    } catch (error) { toast.error(t("admin.feedback.brands.deleteFailed"), getLocalizedErrorMessage(error, language, t("admin.feedback.brands.inUse"))) }
  }

  return <section>
    <PageHeader eyebrow={t("admin.pages.brandsEyebrow")} icon="brands" title={t("admin.brands")} description={t("admin.pages.brandsDescription")} actions={<button className="button" onClick={() => setEditing(null)}>+ {t("admin.pages.addBrand")}</button>} />
    <div className="filters filters--brands"><label className="search-field"><span><Icon name="search" /></span><input aria-label={t("admin.management.searchBrands")} placeholder={t("admin.management.searchBrands")} value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} /></label></div>
    <LoadableContent loading={query.isPending} loadingMessage={t("admin.management.loadingBrands")} error={query.error ? getLocalizedErrorMessage(query.error, language, t("admin.management.loadBrandsError")) : ""} onRetry={() => void query.refetch()}>
      {items.length === 0 ? <EmptyState title={t("admin.management.noBrands")} message={t("admin.management.noBrandsMessage")} action={<button className="button" onClick={() => setEditing(null)}>{t("admin.pages.addBrand")}</button>} /> : <div className="table-card">
        <div className="product-table product-table--head brand-table"><span>{t("admin.management.brand")}</span><span>{t("admin.management.created")}</span><span>{t("admin.management.actions")}</span></div>
        {items.map((brand) => <article className="product-table brand-table" key={brand.id}><div className="product-cell"><span className="category-table__placeholder"><Icon name="brands" /></span><span><strong>{language === "ar" ? brand.name_ar : brand.name_en}</strong><small>{language === "ar" ? brand.name_en : brand.name_ar}</small></span></div><span>{new Date(brand.created_at).toLocaleDateString(language === "ar" ? "ar-PS" : "en-PS")}</span><div className="row-actions"><button className="icon-button" title={t("admin.management.edit")} onClick={() => setEditing(brand)}><Icon name="edit" /></button><button className="icon-button icon-button--danger" title={t("admin.management.delete")} onClick={() => void deleteBrand(brand)}><Icon name="trash" /></button></div></article>)}
      </div>}
    </LoadableContent>
    {editing !== undefined && <BrandFormDialog key={editing?.id ?? "new"} brand={editing} onClose={() => setEditing(undefined)} onSave={(brand, payload) => saveMutation.mutateAsync({ brand, payload }).then(() => undefined)} />}
    {!query.isPending && !query.error && <Pagination page={currentPage} totalPages={totalPages} totalItems={filtered.length} onChange={setPage} />}
  </section>
}

function BrandFormDialog({ brand, onClose, onSave }: { brand: Brand | null; onClose: () => void; onSave: (brand: Brand | null, payload: BrandPayload) => Promise<void> }) {
  const { t, direction, language } = useI18n()
  const [form, setForm] = useState<BrandPayload>({ name_en: brand?.name_en ?? "", name_ar: brand?.name_ar ?? "" })
  const [errors, setErrors] = useState<Partial<Record<keyof BrandPayload, string>>>({})
  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault()
    const nextErrors: typeof errors = {}
    if (!form.name_en.trim()) nextErrors.name_en = t("admin.validation.requiredField")
    if (!form.name_ar.trim()) nextErrors.name_ar = t("admin.validation.requiredField")
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return }
    setSaving(true); setFormError("")
    try { await onSave(brand, { name_en: form.name_en.trim(), name_ar: form.name_ar.trim() }); onClose() }
    catch (error) { setFormError(getLocalizedErrorMessage(error, language, t("admin.validation.saveFailed"))) }
    finally { setSaving(false) }
  }
  return <div className="dialog-backdrop"><form className="form-dialog" dir={direction} lang={language} noValidate onSubmit={(event) => void submit(event)}>
    <div className="form-dialog__header"><div><span>{t("admin.forms.brand.eyebrow")}</span><h2>{t(brand ? "admin.forms.brand.editTitle" : "admin.forms.brand.newTitle")}</h2></div><button type="button" aria-label={t("admin.forms.common.close")} onClick={onClose}><Icon name="close" /></button></div>
    <div className="form-grid"><label>{t("admin.fields.englishName")}<input dir="ltr" maxLength={255} value={form.name_en} onChange={(e) => { setForm({ ...form, name_en: e.target.value }); setErrors({ ...errors, name_en: undefined }) }} required />{errors.name_en && <small className="field-error">{errors.name_en}</small>}</label><label>{t("admin.fields.arabicName")}<input dir="rtl" maxLength={255} value={form.name_ar} onChange={(e) => { setForm({ ...form, name_ar: e.target.value }); setErrors({ ...errors, name_ar: undefined }) }} required />{errors.name_ar && <small className="field-error">{errors.name_ar}</small>}</label></div>
    {formError && <p className="form-error">{formError}</p>}<div className="form-actions"><button type="button" className="button button--ghost" disabled={saving} onClick={onClose}>{t("admin.forms.common.cancel")}</button><button className="button" disabled={saving}>{saving ? t("admin.forms.common.saving") : t("admin.forms.brand.save")}</button></div>
  </form></div>
}
