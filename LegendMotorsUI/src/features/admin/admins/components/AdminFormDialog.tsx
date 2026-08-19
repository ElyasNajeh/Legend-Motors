import { useState, type FormEvent } from "react"
import { getLocalizedErrorMessage } from "@/shared/api/error"
import { Icon } from "@/shared/components/Icon"
import { RequiredMark } from "@/shared/components/AdminComponents"
import { useI18n } from "@/localization/useI18n"
import type { AdminPayload } from "../admins.types"

type AdminFormDialogProps = {
  onClose: () => void
  onSave: (payload: AdminPayload) => Promise<void>
}

export function AdminFormDialog({
  onClose,
  onSave,
}: AdminFormDialogProps) {
  const { t, direction, language } = useI18n()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  async function handleSave(event: FormEvent) {
    event.preventDefault()

    if (saving) {
      return
    }

    const normalizedEmail = email.trim().toLowerCase()
    if (!username.trim() || !normalizedEmail || !password) {
      setFormError(t("admin.forms.admin.validation.required"))
      return
    }

    setSaving(true)
    setFormError("")

    try {
      await onSave({
        username: username.trim(),
        email: normalizedEmail,
        password,
      })

      onClose()
    } catch (caught) {
      setFormError(getLocalizedErrorMessage(caught, language, t("admin.forms.admin.validation.saveFailed")))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="dialog-backdrop">
      <form
        className="form-dialog admin-form"
        dir={direction}
        lang={language}
        noValidate
        onSubmit={(event) => void handleSave(event)}
      >
        <div className="form-dialog__header">
          <div>
            <span>{t("admin.forms.admin.eyebrow")}</span>
            <h2>{t("admin.forms.admin.newTitle")}</h2>
          </div>

          <button
            className="icon-button"
            type="button"
            aria-label={t("admin.forms.common.close")}
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="form-grid form-grid--single">
          <label>
            <span>
              {t("admin.forms.admin.username")} <RequiredMark />
            </span>
            <input value={username} maxLength={255} onChange={(event) => setUsername(event.target.value)} required disabled={saving} />
          </label>
          <label>
            <span>
              {t("admin.forms.admin.email")} <RequiredMark />
            </span>

            <input
              type="email"
              dir="ltr"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={saving}
            />
          </label>

          <label>
            <span>
              {t("admin.forms.admin.temporaryPassword")} <RequiredMark />
            </span>

            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={saving}
            />

          </label>
        </div>

        {formError && (
          <p className="form-error">{formError}</p>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="button button--ghost"
            onClick={onClose}
            disabled={saving}
          >
            {t("admin.forms.common.cancel")}
          </button>

          <button
            className="button"
            disabled={saving}
          >
            {saving ? t("admin.forms.admin.adding") : t("admin.forms.admin.save")}
          </button>
        </div>
      </form>
    </div>
  )
}
