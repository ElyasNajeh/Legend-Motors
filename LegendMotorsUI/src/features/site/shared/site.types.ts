export type CarType = "normal" | "hybrid"
export type Transmission = "automatic" | "manual" | "cvt"

export type PublicBrand = {
  id: number
  name_ar: string
  name_en: string
  created_at: string
}

export type PublicCarImage = {
  id: number
  image: string
  is_primary: boolean
  created_at: string
}

export type PublicCar = {
  id: number
  brand_id: number
  brand: Pick<PublicBrand, "id" | "name_ar" | "name_en">
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
  status: "active" | "bought"
  is_hidden: boolean
  created_at: string
  hybrid_car: { battery_capacity: string | null } | null
  images: PublicCarImage[]
}

export type PublicSlider = {
  id: number
  title_ar: string
  title_en: string
  display_order: number
  is_active: boolean
  image: string
  created_at: string
}
