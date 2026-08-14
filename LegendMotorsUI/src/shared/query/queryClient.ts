import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister"
import { QueryClient } from "@tanstack/react-query"

const FIVE_MINUTES = 5 * 60 * 1000
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

export const QUERY_CACHE_STORAGE_KEY = "ETA_QUERY_CACHE"

function getSessionStorage() {
  try {
    return typeof window === "undefined" ? undefined : window.sessionStorage
  } catch {
    return undefined
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: FIVE_MINUTES,
      gcTime: TWENTY_FOUR_HOURS,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export const queryPersister = createAsyncStoragePersister({
  storage: getSessionStorage(),
  key: QUERY_CACHE_STORAGE_KEY,
})

export const queryPersistOptions = {
  persister: queryPersister,
  maxAge: TWENTY_FOUR_HOURS,
}

export const queryKeys = {
  brands: ["brands"] as const,
  cars: ["cars"] as const,
  sliders: ["sliders"] as const,
  settings: ["settings"] as const,
  admins: ["admins"] as const,
  dashboardStats: ["dashboard", "stats"] as const,
}
