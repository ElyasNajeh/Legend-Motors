import { adminRequest } from "@/shared/api/adminHttpClient"
import type { Slider, SliderPayload } from "./sliders.types"

export const SlidersApi = {
  list: () =>
    adminRequest<Slider[]>({
      url: "/sliders/",
    }),

  create(data: SliderPayload) {
    return adminRequest<Slider>({
      url: "/sliders/",
      method: "POST",
      data,
    })
  },

  update(id: number, data: SliderPayload) {
    return adminRequest<Slider>({
      url: `/sliders/${id}`,
      method: "PUT",
      data,
    })
  },

  delete: (id: number) =>
    adminRequest<Slider>({
      url: `/sliders/${id}`,
      method: "DELETE",
    }),

  toggle: (id: number) =>
    adminRequest<Slider>({
      url: `/sliders/${id}/toggle-status`,
      method: "PATCH",
    }),

  async upload(file: File) {
    const body = new FormData()
    body.append("file", file)

    const result = await adminRequest<{ filename: string; path: string }>({
      url: "/sliders/upload-image",
      method: "POST",
      data: body,
      timeout: 60_000,
    })

    return result.path ?? `/uploads/sliders/${result.filename}`
  },
}
