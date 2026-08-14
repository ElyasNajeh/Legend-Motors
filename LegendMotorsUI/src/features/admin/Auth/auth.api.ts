import axios from "axios"
import { httpClient } from "@/shared/api/httpClient"
import { adminRequest } from "@/shared/api/adminHttpClient"
import { ApiError, getApiErrorMessage } from "@/shared/api/error"
import type * as authTypes from "./auth.types"

async function publicRequest<T>(request: () => Promise<{ data: T }>): Promise<T> {
  try {
    return (await request()).data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.status ?? 0, getApiErrorMessage(error.response?.data, error.message), error.response?.data)
    }
    throw error
  }
}

export function login(request: authTypes.LoginRequest) {
  return publicRequest(() => httpClient.post<authTypes.LoginResponse>("/auth/login", request))
}

export function logout() {
  return publicRequest(() => httpClient.post<authTypes.MessageResponse>("/auth/logout"))
}

export function getMe() {
  return adminRequest<authTypes.User>({ url: "/auth/me" })
}

export function refresh() {
  return publicRequest(() => httpClient.post<authTypes.RefreshResponse>("/auth/refresh"))
}
