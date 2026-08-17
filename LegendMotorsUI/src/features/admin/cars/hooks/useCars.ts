import { useMemo, useState } from "react"
import { queryKeys, useMutation, useQuery } from "@/shared/query/remoteData"
import { BrandsApi } from "@/features/admin/brands/brands.api"
import { useFeedback } from "@/shared/feedback/FeedbackProvider"
import { getLocalizedErrorMessage } from "@/shared/api/error"
import { useI18n } from "@/localization/useI18n"
import { CarsApi } from "../cars.api"
import type {
  Car,
  CarImageSelection,
  CarPayload,
} from "../cars.types"

const PAGE_SIZE = 10

export function useCars() {
  const { toast, confirm } = useFeedback()
  const { t, language } = useI18n()
  const [search, setSearchValue] = useState("")
  const [brandFilter, setBrandFilterValue] = useState("")
  const [typeFilter, setTypeFilterValue] = useState("")
  const [statusFilter, setStatusFilterValue] = useState("")
  const [page, setPage] = useState(1)

  const carsQuery = useQuery({
    queryKey: queryKeys.cars,
    queryFn: CarsApi.list,
  })

  const brandsQuery = useQuery({
    queryKey: queryKeys.brands,
    queryFn: BrandsApi.list,
  })

  const saveMutation = useMutation({
    mutationFn: ({
      car,
      payload,
    }: {
      car: Car | null
      payload: CarPayload
    }) =>
      car
        ? CarsApi.update(car.id, payload)
        : CarsApi.create(payload),
    onSuccess: async (_, { car, payload }) => {
      toast.success(
        t(
          car
            ? "admin.feedback.cars.updated"
            : "admin.feedback.cars.created",
        ),
        t("admin.feedback.cars.saved", {
          name: payload.model,
        }),
      )

      await carsQuery.refetch()
    },
  })

  const filteredItems = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()

    return (carsQuery.data ?? []).filter(
      (car) =>
        (!term ||
          car.model.toLocaleLowerCase().includes(term) ||
          String(car.year).includes(term)) &&
        (!brandFilter || car.brand_id === Number(brandFilter)) &&
        (!typeFilter || car.car_type === typeFilter) &&
        (!statusFilter ||
          car.is_active === (statusFilter === "true")),
    )
  }, [
    brandFilter,
    carsQuery.data,
    search,
    statusFilter,
    typeFilter,
  ])

  const totalItems = filteredItems.length
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const items = filteredItems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  function updateFilter(
    setter: (value: string) => void,
    value: string,
  ) {
    setter(value)
    setPage(1)
  }

  async function saveCar(
    car: Car | null,
    payload: CarPayload,
    images: CarImageSelection,
  ) {
    const saved = await saveMutation.mutateAsync({ car, payload })

    await Promise.all(
      images.files.map(async ({ file, isPrimary }) => {
        const image = await CarsApi.upload(file)
        await CarsApi.addImage(saved.id, image, isPrimary)
      }),
    )

    if (images.primaryExistingImageId !== null) {
      await CarsApi.setPrimaryImage(
        images.primaryExistingImageId,
      )
    }

    if (
      images.files.length ||
      images.primaryExistingImageId !== null
    ) {
      await carsQuery.refetch()
    }
  }

  async function deleteCar(car: Car) {
    if (
      !(await confirm({
        title: t("admin.feedback.cars.deleteTitle"),
        message: t("admin.feedback.cars.deleteMessage", {
          name: car.model,
        }),
        confirmLabel: t("admin.feedback.cars.deleteConfirm"),
        variant: "danger",
      }))
    ) {
      return
    }

    try {
      await CarsApi.delete(car.id)

      toast.success(
        t("admin.feedback.cars.deleted"),
        t("admin.feedback.cars.removed", {
          name: car.model,
        }),
      )

      await carsQuery.refetch()
    } catch (error) {
      toast.error(
        t("admin.feedback.cars.deleteFailed"),
        getLocalizedErrorMessage(
          error,
          language,
          t("admin.feedback.common.tryAgain"),
        ),
      )
    }
  }

  async function toggle(car: Car, featured = false) {
    try {
      await (featured
        ? CarsApi.toggleFeatured(car.id)
        : CarsApi.toggleStatus(car.id))

      toast.success(
        t(
          featured
            ? "admin.feedback.cars.featuredUpdated"
            : "admin.feedback.cars.statusUpdated",
        ),
      )

      await carsQuery.refetch()
    } catch (error) {
      toast.error(
        t("admin.feedback.cars.updateFailed"),
        getLocalizedErrorMessage(
          error,
          language,
          t("admin.feedback.common.tryAgain"),
        ),
      )
    }
  }

  const errorValue = carsQuery.error ?? brandsQuery.error

  return {
    items,
    brands: brandsQuery.data ?? [],
    loading: carsQuery.isPending || brandsQuery.isPending,
    error: errorValue
      ? getLocalizedErrorMessage(
          errorValue,
          language,
          t("admin.feedback.cars.loadFailed"),
        )
      : "",
    search,
    brandFilter,
    typeFilter,
    statusFilter,
    page: currentPage,
    totalPages,
    totalItems,
    setSearch: (value: string) =>
      updateFilter(setSearchValue, value),
    setBrandFilter: (value: string) =>
      updateFilter(setBrandFilterValue, value),
    setTypeFilter: (value: string) =>
      updateFilter(setTypeFilterValue, value),
    setStatusFilter: (value: string) =>
      updateFilter(setStatusFilterValue, value),
    setPage,
    reload: () =>
      Promise.all([
        carsQuery.refetch(),
        brandsQuery.refetch(),
      ]),
    saveCar,
    deleteCar,
    toggleStatus: (car: Car) => toggle(car),
    toggleFeatured: (car: Car) => toggle(car, true),
  }
}
