import { adminRequest } from "@/shared/api/adminHttpClient"
import type { Brand, BrandPayload } from "./brands.types"

export const BrandsApi = {
  list: () => adminRequest<Brand[]>({ url: "/brands/" }),
  create: (data: BrandPayload) => adminRequest<Brand>({ url: "/brands/", method: "POST", data }),
  update: (id: number, data: BrandPayload) => adminRequest<Brand>({ url: `/brands/${id}`, method: "PUT", data }),
  delete: (id: number) => adminRequest<Brand>({ url: `/brands/${id}`, method: "DELETE" }),
}
