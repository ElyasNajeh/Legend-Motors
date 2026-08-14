export type PageResult<T> = {
  items: T[]
  page: number
  limit: number
  total_items: number
  total_pages: number
}

export type PaginationParams = {
  page?: number
  limit?: number
  search?: string
}

export function createQueryString(params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value))
    }
  })

  return query.toString()
}
