import { adminRequest } from "@/shared/api/adminHttpClient"

export type DashboardStats = {
  cars: number
  hybrid_cars: number
  normal_cars: number
  brands: number
  sliders: number
}

export const DashboardApi = {
  stats: () => adminRequest<DashboardStats>({ url: "/dashboard/stats" }),
}
