import { adminRequest } from "@/shared/api/adminHttpClient"
import type { Car, CarImage, CarPayload } from "./cars.types"

export const CarsApi = {
  list: () =>
    adminRequest<Car[]>({
      url: "/cars/",
    }),

  create: (data: CarPayload) =>
    adminRequest<Car>({
      url: "/cars/",
      method: "POST",
      data,
    }),

  update: (id: number, data: CarPayload) =>
    adminRequest<Car>({
      url: `/cars/${id}`,
      method: "PUT",
      data,
    }),

  delete: (id: number) =>
    adminRequest<void>({
      url: `/cars/${id}`,
      method: "DELETE",
    }),

  updateBought: (id: number, isBought: boolean) =>
    adminRequest<Car>({
      url: `/cars/${id}/bought`,
      method: "PATCH",
      data: { is_bought: isBought },
    }),

  updateActive: (id: number, isActive: boolean) =>
    adminRequest<Car>({
      url: `/cars/${id}/active`,
      method: "PATCH",
      data: { is_active: isActive },
    }),

  toggleFeatured: (id: number) =>
    adminRequest<Car>({
      url: `/cars/${id}/toggle-featured`,
      method: "PATCH",
    }),

  addImage: (
    carId: number,
    image: string,
    isPrimary: boolean,
  ) =>
    adminRequest<CarImage>({
      url: `/cars/${carId}/images`,
      method: "POST",
      data: {
        image,
        is_primary: isPrimary,
      },
    }),

  setPrimaryImage: (imageId: number) =>
    adminRequest<CarImage>({
      url: `/cars/images/${imageId}/set-primary`,
      method: "PATCH",
    }),

  deleteImage: (imageId: number) =>
    adminRequest<CarImage>({
      url: `/cars/images/${imageId}`,
      method: "DELETE",
    }),

  async upload(file: File) {
    const data = new FormData()
    data.append("file", file)

    const result = await adminRequest<{ filename: string }>({
      url: "/cars/upload-image",
      method: "POST",
      data,
      timeout: 60_000,
    })

    return `/uploads/cars/${result.filename}`
  },
}
