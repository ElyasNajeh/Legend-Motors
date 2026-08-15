import { queryKeys, useMutation, useQuery } from "@/shared/query/remoteData"
import { useFeedback } from "@/shared/feedback/FeedbackProvider"
import { AdminsApi } from "../admins.api"
import type { Admin, AdminPayload } from "../admins.types"
import { getLocalizedErrorMessage } from "@/shared/api/error"
import { useI18n } from "@/localization/useI18n"

export function useAdmins(currentAdminId: number | undefined) {
  const { toast, confirm } = useFeedback()
  const { t, language } = useI18n()
  const adminsQuery = useQuery({
    queryKey: queryKeys.admins,
    queryFn: AdminsApi.list,
  })

  const createMutation = useMutation({
    mutationFn: AdminsApi.create,
    onSuccess: async (_, payload) => {
      toast.success(t("admin.feedback.admins.created"), t("admin.feedback.admins.createdMessage", { email: payload.email }))
      await adminsQuery.refetch()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (admin: Admin) => AdminsApi.delete(admin.id),
    onSuccess: async (_, admin) => {
      toast.success(t("admin.feedback.admins.deleted"), t("admin.feedback.admins.deletedMessage", { email: admin.email }))
      await adminsQuery.refetch()
    },
  })

  async function createAdmin(payload: AdminPayload) {
    await createMutation.mutateAsync(payload)
  }

  async function deleteAdmin(admin: Admin) {
    if (admin.id === currentAdminId) {
      return
    }

    const confirmed = await confirm({
      title: t("admin.feedback.admins.deleteTitle"),
      message: t("admin.feedback.admins.deleteMessage", { email: admin.email }),
      confirmLabel: t("admin.feedback.admins.deleteConfirm"),
      variant: "danger",
    })

    if (!confirmed) {
      return
    }

    try {
      await deleteMutation.mutateAsync(admin)
    } catch (caught) {
      toast.error(t("admin.feedback.admins.deleteFailed"), getLocalizedErrorMessage(caught, language, t("admin.feedback.common.tryAgain")))
    }
  }

  const error = adminsQuery.error
    ? getLocalizedErrorMessage(adminsQuery.error, language, t("admin.feedback.admins.loadFailed"))
    : ""

  return {
    items: adminsQuery.data ?? [],
    loading: adminsQuery.isPending,
    error,
    reload: adminsQuery.refetch,
    createAdmin,
    deleteAdmin,
  }
}
