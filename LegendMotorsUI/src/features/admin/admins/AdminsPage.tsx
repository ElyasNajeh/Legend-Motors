import { useState } from "react"
import { useAuth } from "@/features/admin/Auth/AuthProvider"
import { PageHeader } from "@/shared/components/AdminComponents"
import { Icon } from "@/shared/components/Icon"
import { AdminFormDialog } from "./components/AdminFormDialog"
import { AdminList } from "./components/AdminList"
import { useAdmins } from "./hooks/useAdmins"
import { useI18n } from "@/localization/useI18n"

export function AdminsPage() {
  const { user } = useAuth()
  const admins = useAdmins(user?.id)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { t } = useI18n()

  return (
    <section>
      <PageHeader
        eyebrow={t("admin.pages.adminsEyebrow")}
        icon="admins"
        title={t("admin.admins")}
        description={t("admin.pages.adminsDescription")}
        actions={(
          <button className="button" onClick={() => setIsFormOpen(true)}>
            <Icon name="plus" />{t("admin.pages.addAdmin")}
          </button>
        )}
      />

      <AdminList
        admins={admins.items}
        currentAdminId={user?.id}
        loading={admins.loading}
        error={admins.error}
        onDelete={(admin) => void admins.deleteAdmin(admin)}
        onRetry={() => void admins.reload()}
      />

      {isFormOpen && (
        <AdminFormDialog
          onClose={() => setIsFormOpen(false)}
          onSave={admins.createAdmin}
        />
      )}
    </section>
  )
}
