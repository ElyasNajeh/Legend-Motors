import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { ApiError } from "@/shared/api/error"

type RequestOptions = {
  silentStatuses?: number[]
}

type RequestContextValue = {
  loadingCount: number
  isLoading: boolean

  runRequest: <T>(
    request: () => Promise<T>,
    options?: RequestOptions,
  ) => Promise<T>
}

const RequestContext = createContext<RequestContextValue | undefined>(
  undefined,
)

type RequestProviderProps = {
  children: ReactNode
}

function showRequestError(error: unknown) {
  if (error instanceof ApiError) {
    // Replace this with your toast library:
    // toast.error(error.message)

    console.error(error.message)
    return
  }

  console.error("Something went wrong")
}

export function RequestProvider({
  children,
}: RequestProviderProps) {
  const [loadingCount, setLoadingCount] = useState(0)

  const isLoading = loadingCount > 0

  const runRequest = useCallback(
    async function runRequest<T>(
      request: () => Promise<T>,
      options: RequestOptions = {},
    ): Promise<T> {
      setLoadingCount((count) => count + 1)

      try {
        return await request()
      } catch (error) {
        const status =
          error instanceof ApiError
            ? error.status
            : undefined

        const shouldStaySilent =
          status !== undefined &&
          options.silentStatuses?.includes(status)

        if (!shouldStaySilent) {
          showRequestError(error)
        }

        throw error
      } finally {
        setLoadingCount((count) =>
          Math.max(0, count - 1),
        )
      }
    },
    [],
  )

  const value = useMemo(
    () => ({
      loadingCount,
      isLoading,
      runRequest,
    }),
    [loadingCount, isLoading, runRequest],
  )

  return (
    <RequestContext.Provider value={value}>
      {children}
    </RequestContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRequest() {
  const context = useContext(RequestContext)

  if (!context) {
    throw new Error(
      "useRequest must be used inside RequestProvider",
    )
  }

  return context
}
