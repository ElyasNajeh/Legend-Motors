import type { AxiosError } from "axios"

export type ApiErrorKind = "timeout" | "network" | "backend"

export class ApiError extends Error {
  status: number
  data: unknown
  kind: ApiErrorKind

  constructor(
    status: number,
    message: string,
    data: unknown = null,
    kind: ApiErrorKind = status === 0 ? "network" : "backend",
  ) {
    super(message)

    this.name = "ApiError"
    this.status = status
    this.data = data
    this.kind = kind
  }
}

const arabicBackendMessages: Record<string, string> = {
  "Uploaded image is empty": "ملف الصورة فارغ.",

  "No visible subject was detected in the image":
    "العنصر المطلوب غير ظاهر بوضوح في الصورة.",

  "Invalid or corrupted image":
    "الصورة غير صالحة أو ملفها تالف.",

  "Invalid email or password":
    "البريد الإلكتروني أو كلمة المرور غير صحيحة.",

  "Refresh token missing":
    "انتهت جلسة الدخول. سجّل دخول من جديد.",

  "Invalid refresh token":
    "انتهت جلسة الدخول. سجّل دخول من جديد.",

  "Access token missing":
    "يجب تسجيل الدخول حتى تكمل.",

  "Invalid access token":
    "انتهت جلسة الدخول. سجّل دخول من جديد.",

  "Not authenticated":
    "يجب تسجيل الدخول حتى تكمل.",

  "Admin not found":
    "المشرف المطلوب غير موجود.",

  "Username already exists":
    "اسم المستخدم مستخدم من قبل.",

  "Email already exists":
    "البريد الإلكتروني مستخدم من قبل.",

  "Brand already exists":
    "الماركة موجودة من قبل.",

  "Brand not found":
    "الماركة المطلوبة غير موجودة.",

  "Brand is assigned to one or more cars":
    "الماركة مرتبطة بسيارة أو أكثر. انقل السيارات أو احذفها أولاً.",

  "Slider already exists":
    "الشريحة موجودة من قبل.",

  "Display order already exists":
    "ترتيب العرض مستخدم لشريحة ثانية.",

  "Slider not found":
    "الشريحة المطلوبة غير موجودة.",

  "Hybrid details are not allowed for normal cars":
    "لا يمكن إضافة تفاصيل هايبرد لسيارة عادية.",

  "Hybrid car details are required":
    "يجب إدخال تفاصيل سيارة الهايبرد.",

  "Invalid car type":
    "نوع السيارة غير صحيح.",

  "Car not found":
    "السيارة المطلوبة غير موجودة.",

  "Car image not found":
    "صورة السيارة المطلوبة غير موجودة.",

  "Internal Server Error":
    "حدث خطأ غير متوقع. جرّب مرة ثانية.",

  "Method Not Allowed":
    "العملية المطلوبة غير متاحة.",

  "Not Found":
    "العنصر المطلوب غير موجود.",
}

const arabicFieldLabels: Record<string, string> = {
  brand_id: "الماركة",
  model: "الموديل",
  year: "سنة الصنع",
  mileage: "المسافة المقطوعة",
  transmission: "ناقل الحركة",
  horsepower: "القوة الحصانية",
  fuel_type: "نوع الوقود",
  engine_cc: "سعة المحرك",
  is_turbo: "التيربو",
  description_ar: "الوصف بالعربي",
  description_en: "الوصف بالإنجليزي",
  is_featured: "السيارات المميزة",
  is_bought: "مباعة",
  is_active: "الظهور في المعرض",
  car_type: "نوع السيارة",
  hybrid_details: "تفاصيل الهايبرد",
  battery_capacity: "سعة البطارية",
  image: "الصورة",
  file: "الملف",
  name_ar: "الاسم بالعربي",
  name_en: "الاسم بالإنجليزي",
  title_ar: "العنوان بالعربي",
  title_en: "العنوان بالإنجليزي",
  display_order: "ترتيب العرض",
  email: "البريد الإلكتروني",
  username: "اسم المستخدم",
  password: "كلمة المرور",
}

function translateBackendMessage(message: string, language: "en" | "ar") {
  const cleanMessage = message.trim()
  return language === "ar"
    ? arabicBackendMessages[cleanMessage] ?? cleanMessage
    : cleanMessage
}

function translateValidationMessage(message: string, language: "en" | "ar") {
  const cleanMessage = message.replace(/^Value error,\s*/i, "").trim()

  if (language === "en") return cleanMessage
  if (cleanMessage === "Field required") return "هذا الحقل مطلوب."
  if (/valid integer/i.test(cleanMessage)) return "أدخل رقماً صحيحاً."
  if (/valid number|valid decimal/i.test(cleanMessage)) return "أدخل رقماً صالحاً."
  if (/valid boolean/i.test(cleanMessage)) return "القيمة المدخلة غير صحيحة."
  if (/valid string/i.test(cleanMessage)) return "أدخل نصاً صالحاً."
  if (/input should be/i.test(cleanMessage)) return "القيمة المدخلة غير مقبولة."

  return translateBackendMessage(cleanMessage, language)
}

function formatFieldPath(location: unknown[], language: "en" | "ar") {
  const parts = location.filter(
    (part) => part !== "body" && part !== "query" && part !== "path",
  )

  return parts
    .map((part) => {
      if (typeof part === "number") return String(part + 1)

      const field = String(part)
      if (language === "ar") return arabicFieldLabels[field] ?? field

      return field.replaceAll("_", " ")
    })
    .join(language === "ar" ? " - " : " > ")
}

function getErrorMessageFromData(
  data: unknown,
  language: "en" | "ar",
): string | null {
  if (typeof data === "string" && data.trim()) {
    return translateBackendMessage(data, language)
  }

  if (typeof data !== "object" || data === null) return null

  if ("detail" in data && typeof data.detail === "string") {
    return translateBackendMessage(data.detail, language)
  }

  if ("detail" in data && Array.isArray(data.detail)) {
    const messages = data.detail.flatMap((item) => {
      if (
        typeof item !== "object" ||
        item === null ||
        !("msg" in item) ||
        typeof item.msg !== "string"
      ) {
        return []
      }

      const location =
        "loc" in item && Array.isArray(item.loc) ? item.loc : []
      const field = formatFieldPath(location, language)
      const message = translateValidationMessage(item.msg, language)

      return [field ? `${field}: ${message}` : message]
    })

    if (messages.length) return messages.join(" ")
  }

  if ("message" in data && typeof data.message === "string") {
    return translateBackendMessage(data.message, language)
  }

  if ("error" in data && typeof data.error === "string") {
    return translateBackendMessage(data.error, language)
  }

  return null
}

export function getLocalizedErrorMessage(
  error: unknown,
  language: "en" | "ar",
  fallback: string,
) {
  if (error instanceof ApiError && error.kind === "timeout") {
    return language === "ar"
      ? "انتهت مهلة الاتصال بالخادم. جرّب مرة ثانية."
      : "The server took too long to respond. Please try again."
  }

  if (error instanceof ApiError && error.kind === "network") {
    return language === "ar"
      ? "تعذّر الاتصال بالخادم. تأكد من الإنترنت وجرّب مرة ثانية."
      : "Could not reach the server. Check your connection and try again."
  }

  if (error instanceof ApiError) {
    return getErrorMessageFromData(error.data, language) ?? fallback
  }

  return error instanceof Error && error.message
    ? error.message
    : fallback
}

export function getApiErrorMessage(
  data: unknown,
  fallback = "Something went wrong",
): string {
  return getErrorMessageFromData(data, "en") ?? fallback
}

export function createApiError(error: AxiosError) {
  const isTimeout =
    error.code === "ECONNABORTED" || error.code === "ETIMEDOUT"
  const kind: ApiErrorKind = isTimeout
    ? "timeout"
    : error.response
      ? "backend"
      : "network"

  return new ApiError(
    error.response?.status ?? 0,
    getApiErrorMessage(error.response?.data, error.message),
    error.response?.data,
    kind,
  )
}
