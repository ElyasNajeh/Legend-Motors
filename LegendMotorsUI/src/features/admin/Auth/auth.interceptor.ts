import type { AxiosError, InternalAxiosRequestConfig } from "axios"

import { adminHttpClient } from "@/shared/api/adminHttpClient"
import { refresh } from "./auth.api"

import {
  clearAccessToken,
  setAccessToken,
} from "./token-store"

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refresh()
      .then((response) => {
        const token = response.access_token

        setAccessToken(token)

        return token
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

export function setupAuthInterceptor() {
  adminHttpClient.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
      const originalRequest =
        error.config as RetryableRequestConfig | undefined

      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest._retry
      ) {
        return Promise.reject(error)
      }

      originalRequest._retry = true

      try {
        await refreshAccessToken()

        return adminHttpClient(originalRequest)
      } catch (refreshError) {
        clearAccessToken()
        window.dispatchEvent(new Event("eta-auth-expired"))

        return Promise.reject(refreshError)
      }
    }
  )
}
