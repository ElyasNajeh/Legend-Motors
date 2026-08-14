import { useState } from "react"
import { PageHeader, Pagination } from "@/shared/components/AdminComponents"
import { SliderFilters } from "./components/SliderFilters"
import { SliderFormDialog } from "./components/SliderFormDialog"
import { SliderTable } from "./components/SliderTable"
import { useSliders } from "./hooks/useSliders"
import type { Slider } from "./sliders.types"
import { useI18n } from "@/localization/useI18n"

type EditingSlider = Slider | null | undefined

export function SlidersPage() {
  const sliders = useSliders()
  const { t } = useI18n()
  const [editingSlider, setEditingSlider] = useState<EditingSlider>(() =>
    new URLSearchParams(window.location.search).has("new") ? null : undefined,
  )

  return (
    <section>
      <PageHeader
        eyebrow={t("admin.pages.slidersEyebrow")}
        icon="sliders"
        title={t("admin.sliders")}
        description={t("admin.pages.slidersDescription")}
        actions={<button className="button" onClick={() => setEditingSlider(null)}>+ {t("admin.pages.addSlider")}</button>}
      />

      <SliderFilters
        search={sliders.search}
        status={sliders.statusFilter}
        onSearchChange={sliders.setSearch}
        onStatusChange={sliders.setStatusFilter}
      />

      <SliderTable
        items={sliders.items}
        loading={sliders.loading}
        error={sliders.error}
        onCreate={() => setEditingSlider(null)}
        onEdit={setEditingSlider}
        onToggle={(slider) => void sliders.toggleSlider(slider)}
        onDelete={(slider) => void sliders.deleteSlider(slider)}
        onRetry={() => void sliders.reload()}
      />

      {editingSlider !== undefined && (
        <SliderFormDialog
          key={editingSlider?.id ?? "new"}
          slider={editingSlider}
          onClose={() => setEditingSlider(undefined)}
          onSave={sliders.saveSlider}
        />
      )}

      {!sliders.loading && !sliders.error && (
        <Pagination
          page={sliders.page}
          totalPages={sliders.totalPages}
          totalItems={sliders.totalItems}
          onChange={sliders.setPage}
        />
      )}
    </section>
  )
}
