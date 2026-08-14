export type Slider = {
  id: number
  title_ar: string
  title_en: string
  display_order: number
  is_active: boolean
  image: string
  created_at: string
}

export type SliderPayload = {
  title_ar: string
  title_en: string
  display_order: number
  image: string
}

export type SliderFormValues = {
  title_ar: string
  title_en: string
  display_order: string
  is_active: boolean
  image: string
}
