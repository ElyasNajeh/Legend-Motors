import { useMemo, useState } from "react"
import { queryKeys, useMutation, useQuery } from "@/shared/query/remoteData"
import { useFeedback } from "@/shared/feedback/FeedbackProvider"
import { SlidersApi } from "../sliders.api"
import type { Slider, SliderPayload } from "../sliders.types"
import { getLocalizedErrorMessage } from "@/shared/api/error"
import { useI18n } from "@/localization/useI18n"

const PAGE_SIZE = 10

export function useSliders() {
  const { toast, confirm } = useFeedback()
  const { t, language } = useI18n()
  const [search, setSearchValue] = useState("")
  const [statusFilter, setStatusFilterValue] = useState("")
  const [page, setPage] = useState(1)

  const slidersQuery = useQuery({
    queryKey: queryKeys.sliders,
    queryFn: SlidersApi.list,
    select: (sliders) =>
      [...sliders].sort(
        (first, second) => first.display_order - second.display_order,
      ),
  })

  const saveMutation = useMutation({
    mutationFn: async ({
      slider,
      payload,
      isActive,
    }: {
      slider: Slider | null
      payload: SliderPayload
      isActive: boolean
    }) => {
      const savedSlider = slider
        ? await SlidersApi.update(slider.id, payload)
        : await SlidersApi.create(payload)

      if (savedSlider.is_active !== isActive) {
        return SlidersApi.toggle(savedSlider.id)
      }

      return savedSlider
    },
    onSuccess: async (_, { slider, payload }) => {
      toast.success(
        t(
          slider
            ? "admin.feedback.sliders.updated"
            : "admin.feedback.sliders.created",
        ),
        t("admin.feedback.sliders.saved", {
          name: language === "ar" ? payload.title_ar : payload.title_en,
        }),
      )

      await slidersQuery.refetch()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (slider: Slider) => SlidersApi.delete(slider.id),
    onSuccess: async (_, slider) => {
      toast.success(
        t("admin.feedback.sliders.deleted"),
        t("admin.feedback.sliders.removed", {
          name: language === "ar" ? slider.title_ar : slider.title_en,
        }),
      )

      await slidersQuery.refetch()
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (slider: Slider) => SlidersApi.toggle(slider.id),
    onSuccess: async (_, slider) => {
      toast.success(
        t(
          slider.is_active
            ? "admin.feedback.sliders.hidden"
            : "admin.feedback.sliders.activated",
        ),
        t(
          slider.is_active
            ? "admin.feedback.sliders.hiddenMessage"
            : "admin.feedback.sliders.activatedMessage",
        ),
      )

      await slidersQuery.refetch()
    },
  })

  const filteredItems = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()

    return (slidersQuery.data ?? []).filter((slider) => {
      const matchesSearch =
        !term ||
        slider.title_en.toLocaleLowerCase().includes(term) ||
        slider.title_ar.toLocaleLowerCase().includes(term)

      const matchesStatus =
        !statusFilter || slider.is_active === (statusFilter === "true")

      return matchesSearch && matchesStatus
    })
  }, [slidersQuery.data, search, statusFilter])

  const totalItems = filteredItems.length
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const items = filteredItems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )
  const nextDisplayOrder = slidersQuery.data
    ? slidersQuery.data.reduce(
        (highestOrder, slider) => Math.max(highestOrder, slider.display_order),
        0,
      ) + 1
    : null

  function updateFilter(setter: (value: string) => void, value: string) {
    setter(value)
    setPage(1)
  }

  async function saveSlider(
    slider: Slider | null,
    payload: SliderPayload,
    isActive: boolean,
  ) {
    await saveMutation.mutateAsync({
      slider,
      payload,
      isActive,
    })
  }

  async function deleteSlider(slider: Slider) {
    const confirmed = await confirm({
      title: t("admin.feedback.sliders.deleteTitle"),
      message: t("admin.feedback.sliders.deleteMessage", {
        name: language === "ar" ? slider.title_ar : slider.title_en,
      }),
      confirmLabel: t("admin.feedback.sliders.deleteConfirm"),
      variant: "danger",
    })

    if (!confirmed) {
      return
    }

    try {
      await deleteMutation.mutateAsync(slider)
    } catch (caught) {
      toast.error(
        t("admin.feedback.sliders.deleteFailed"),
        getLocalizedErrorMessage(
          caught,
          language,
          t("admin.feedback.common.tryAgain"),
        ),
      )
    }
  }

  async function toggleSlider(slider: Slider) {
    try {
      await toggleMutation.mutateAsync(slider)
    } catch (caught) {
      toast.error(
        t("admin.feedback.sliders.statusFailed"),
        getLocalizedErrorMessage(
          caught,
          language,
          t("admin.feedback.common.tryAgain"),
        ),
      )
    }
  }

  const error = slidersQuery.error
    ? getLocalizedErrorMessage(
        slidersQuery.error,
        language,
        t("admin.feedback.sliders.loadFailed"),
      )
    : ""

  return {
    items,
    loading: slidersQuery.isPending,
    error,
    search,
    statusFilter,
    page: currentPage,
    totalPages,
    totalItems,
    nextDisplayOrder,
    setSearch: (value: string) => updateFilter(setSearchValue, value),
    setStatusFilter: (value: string) =>
      updateFilter(setStatusFilterValue, value),
    setPage,
    reload: slidersQuery.refetch,
    saveSlider,
    deleteSlider,
    toggleSlider,
  }
}
