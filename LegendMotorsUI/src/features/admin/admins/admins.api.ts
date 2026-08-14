import { adminRequest } from "@/shared/api/adminHttpClient"
import type { Admin, AdminPayload } from "./admins.types"

export type { Admin, AdminPayload } from "./admins.types"

export const AdminsApi = {
  list: () => adminRequest<Admin[]>({ url: "/admins/" }),
  create: (data: AdminPayload) => adminRequest<Admin>({ url: "/admins/", method: "POST", data }),
  delete: (id: number) => adminRequest<Admin>({ url: `/admins/${id}`, method: "DELETE" }),
}
