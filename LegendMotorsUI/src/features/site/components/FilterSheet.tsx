import { useEffect, useRef, type ReactNode } from "react"
import { useI18n } from "@/localization/useI18n"
import { SiteIcon } from "./SiteIcon"

export function FilterSheet({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
}) {
  const { t } = useI18n()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="filter-sheet"
      aria-labelledby="filter-sheet-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClose={onClose}
    >
      <div className="filter-sheet__header">
        <h2 id="filter-sheet-title">
          {t("public.cars.filterTitle")}
        </h2>

        <button
          type="button"
          onClick={onClose}
          aria-label={t("public.nav.close")}
        >
          <SiteIcon name="close" />
        </button>
      </div>

      <div className="filter-sheet__body">{children}</div>

      <button
        className="site-button site-button--dark filter-sheet__done"
        type="button"
        onClick={onClose}
      >
        {t("public.actions.showCars")}
      </button>
    </dialog>
  )
}