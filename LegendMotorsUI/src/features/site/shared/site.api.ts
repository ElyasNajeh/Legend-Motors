import axios, { type AxiosRequestConfig } from "axios"
import { httpClient } from "@/shared/api/httpClient"
import { createApiError } from "@/shared/api/error"
import type { PublicBrand, PublicCar, PublicSlider } from "./site.types"

async function publicRequest<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await httpClient.request<T>(config)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw createApiError(error)
    }
    throw error
  }
}

export const SiteApi = {
  cars: () => publicRequest<PublicCar[]>({ url: "/cars/active" }),
  car: (id: number) => publicRequest<PublicCar>({ url: `/cars/${id}` }),
  brands: () => publicRequest<PublicBrand[]>({ url: "/brands/" }),
  sliders: () => publicRequest<PublicSlider[]>({ url: "/sliders/active" }),
}
