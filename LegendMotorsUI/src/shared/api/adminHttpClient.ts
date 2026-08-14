import axios, { type AxiosRequestConfig } from "axios"
import { env } from "../env"
import { getAccessToken } from "../../features/admin/Auth/token-store"
import { ApiError, getApiErrorMessage } from "./error"

export const adminHttpClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
})

adminHttpClient.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export async function adminRequest<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await adminHttpClient.request<T>(config)
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

