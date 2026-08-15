import { useCallback, useEffect, useRef, useState } from "react"

type QueryOptions<TSource, TData> = {
  queryKey?: readonly unknown[]
  queryFn: () => Promise<TSource>
  enabled?: boolean
  select?: (value: TSource) => TData
}

export function useQuery<TSource, TData = TSource>({
  queryKey = [],
  queryFn,
  enabled = true,
  select,
}: QueryOptions<TSource, TData>) {
  const optionsRef = useRef({ queryFn, select })
  const requestIdRef = useRef(0)
  const [data, setData] = useState<TData>()
  const [error, setError] = useState<unknown>(null)
  const [pending, setPending] = useState(enabled)
  const requestKey = JSON.stringify(queryKey)

  useEffect(() => {
    optionsRef.current = { queryFn, select }
  }, [queryFn, select])

  const refetch = useCallback(async () => {
    const requestId = ++requestIdRef.current
    setPending(true)
    setError(null)

    try {
      const value = await optionsRef.current.queryFn()
      const nextData = optionsRef.current.select
        ? optionsRef.current.select(value)
        : value as unknown as TData

      if (requestId === requestIdRef.current) {
        setData(nextData)
        setPending(false)
      }

      return nextData
    } catch (caught) {
      if (requestId === requestIdRef.current) {
        setError(caught)
        setPending(false)
      }

      return undefined
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      return
    }

    let active = true
    queueMicrotask(() => {
      if (active) void refetch()
    })

    return () => {
      active = false
      requestIdRef.current += 1
    }
  }, [enabled, refetch, requestKey])

  return { data, error, isError: error !== null, isPending: enabled && pending, refetch }
}

type MutationOptions<TData, TVariables> = {
  mutationFn: (variables: TVariables) => Promise<TData>
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>
}

export function useMutation<TData, TVariables>({
  mutationFn,
  onSuccess,
}: MutationOptions<TData, TVariables>) {
  const optionsRef = useRef({ mutationFn, onSuccess })

  useEffect(() => {
    optionsRef.current = { mutationFn, onSuccess }
  }, [mutationFn, onSuccess])

  const mutateAsync = useCallback(async (variables: TVariables) => {
    const value = await optionsRef.current.mutationFn(variables)
    await optionsRef.current.onSuccess?.(value, variables)
    return value
  }, [])

  return { mutateAsync }
}

export const queryKeys = {
  brands: ["brands"] as const,
  cars: ["cars"] as const,
  sliders: ["sliders"] as const,
  settings: ["settings"] as const,
  admins: ["admins"] as const,
  dashboardStats: ["dashboard", "stats"] as const,
}
