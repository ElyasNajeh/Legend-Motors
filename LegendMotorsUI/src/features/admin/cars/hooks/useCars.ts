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
    const preparedImages: Array<{
      image: string
      isPrimary: boolean
    }> = []

    // For a new car, finish processing every phone photo before creating the
    // inventory record. A failed upload therefore cannot leave a duplicate or
    // image-less car behind when the administrator retries.
    if (!car) {
      for (const { file, isPrimary } of images.files) {
        preparedImages.push({
          image: await CarsApi.upload(file),
          isPrimary,
        })
      }
    }

    const saved = await saveMutation.mutateAsync({ car, payload })

    try {
      const imagesToAttach = car
        ? await Promise.all(
            images.files.map(async ({ file, isPrimary }) => ({
              image: await CarsApi.upload(file),
              isPrimary,
            })),
          )
        : preparedImages

      for (const { image, isPrimary } of imagesToAttach) {
        await CarsApi.addImage(saved.id, image, isPrimary)
      }

      for (const imageId of images.deletedExistingImageIds) {
        await CarsApi.deleteImage(imageId)
      }

      if (images.primaryExistingImageId !== null) {
        await CarsApi.setPrimaryImage(
          images.primaryExistingImageId,
        )
      }

      await carsQuery.refetch()

      toast.success(
        t(
          car
            ? "admin.feedback.cars.updated"
            : "admin.feedback.cars.created",
        ),
        t(
          car
            ? "admin.feedback.cars.updatedMessage"
            : "admin.feedback.cars.createdMessage",
          { name: payload.model },
        ),
      )
    } catch (error) {
      if (!car) {
        try {
          await CarsApi.delete(saved.id)
          await carsQuery.refetch()
        } catch {
          // Keep the original image/save error for the administrator.
        }
      }

      throw error
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
          t("admin.feedback.cars.deleteFailedMessage"),
        ),
      )
    }
  }

  async function toggle(car: Car, featured = false) {
    try {
      const updated = await (featured
        ? CarsApi.toggleFeatured(car.id)
        : CarsApi.toggleStatus(car.id))

      toast.success(
        t(
          featured
            ? "admin.feedback.cars.featuredUpdated"
            : "admin.feedback.cars.statusUpdated",
        ),
        t(
          featured
            ? updated.is_featured
              ? "admin.feedback.cars.featuredEnabledMessage"
              : "admin.feedback.cars.featuredDisabledMessage"
            : updated.is_active
              ? "admin.feedback.cars.activatedMessage"
              : "admin.feedback.cars.hiddenMessage",
          { name: car.model },
        ),
      )

      await carsQuery.refetch()
    } catch (error) {
      toast.error(
        t("admin.feedback.cars.updateFailed"),
        getLocalizedErrorMessage(
          error,
          language,
          t("admin.feedback.cars.updateFailedMessage"),
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
