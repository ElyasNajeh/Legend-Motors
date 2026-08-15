import axios, { type AxiosRequestConfig } from "axios"
import { httpClient } from "@/shared/api/httpClient"
import { ApiError, getApiErrorMessage } from "@/shared/api/error"
import type { PublicBrand, PublicCar, PublicSlider } from "./site.types"

async function publicRequest<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await httpClient.request<T>(config)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(
        error.response?.status ?? 0,
        getApiErrorMessage(error.response?.data, error.message),
        error.response?.data,
      )
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
