export type CarType = "normal" | "hybrid"
export type Transmission = "automatic" | "manual" | "cvt"

export type CarImage = { id: number; image: string; is_primary: boolean; created_at: string }

export type CarImageSelection = {
  files: Array<{ file: File; isPrimary: boolean }>
  primaryExistingImageId: number | null
  deletedExistingImageIds: number[]
}

export type Car = {
  id: number
  brand_id: number
  model: string
  year: number
  mileage: number
  transmission: Transmission
  horsepower: number
  fuel_type: string
  engine_cc: number
  is_turbo: boolean
  car_type: CarType
  description_ar: string | null
  description_en: string | null
  is_featured: boolean
  is_bought: boolean
  is_active: boolean
  created_at: string
  hybrid_car: { battery_capacity: string | null } | null
  images: CarImage[]
  brand: { id: number; name_ar: string; name_en: string }
}

export type CarPayload = {
  brand_id: number
  model: string
  year: number
  mileage: number
  transmission: Transmission
  horsepower: number
  fuel_type: string
  engine_cc: number
  is_turbo: boolean
  description_ar: string | null
  description_en: string | null
  is_featured: boolean
  is_bought: boolean
  is_active: boolean
  car_type: CarType
  hybrid_details: { battery_capacity: string | null } | null
}

export type CarFormValues = {
  brand_id: string
  model: string
  year: string
  mileage: string
  transmission: Transmission
  horsepower: string
  fuel_type: string
  engine_cc: string
  is_turbo: boolean
  description_ar: string
  description_en: string
  is_featured: boolean
  is_bought: boolean
  is_active: boolean
  car_type: CarType
  battery_capacity: string
}
