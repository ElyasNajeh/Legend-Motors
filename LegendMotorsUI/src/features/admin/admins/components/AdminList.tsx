import { EmptyState, LoadableContent } from "@/shared/components/AdminComponents"
import { Icon } from "@/shared/components/Icon"
import type { Admin } from "../admins.types"
import { useI18n } from "@/localization/useI18n"

type AdminListProps = {
  admins: Admin[]
  currentAdminId: number | undefined
  loading: boolean
  error: string
  onDelete: (admin: Admin) => void
  onRetry: () => void
}

export function AdminList(props: AdminListProps) {
  const { t } = useI18n()
  return (
    <LoadableContent
      loading={props.loading}
      loadingMessage={t("admin.management.loadingAdmins")}
      error={props.error}
      onRetry={props.onRetry}
    >
      {props.admins.length === 0 ? (
        <EmptyState
          title={t("admin.management.noAdmins")}
          message={t("admin.management.noAdminsMessage")}
        />
      ) : (
        <div className="admin-list">
          {props.admins.map((admin) => {
            const isCurrentAdmin = admin.id === props.currentAdminId

            return (
              <article className="admin-card" key={admin.id}>
                <span className="admin-avatar">{admin.username[0]?.toUpperCase()}</span>
                <div>
                  <strong>{admin.username}</strong>
                  <small>{admin.email}</small>
                  {isCurrentAdmin && <span className="current-admin">{t("admin.management.currentAccount")}</span>}
                </div>
                <button
                  className="button button--small button--text-danger"
                  disabled={isCurrentAdmin}
                  title={t(isCurrentAdmin ? "admin.management.cannotDeleteSelf" : "admin.management.deleteAdmin")}
                  onClick={() => props.onDelete(admin)}
                >
                  <Icon name="trash" />{t("admin.management.delete")}
                </button>
              </article>
            )
          })}
        </div>
      )}
    </LoadableContent>
  )
}
