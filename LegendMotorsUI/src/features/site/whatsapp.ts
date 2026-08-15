import { env } from "@/shared/env"

export function getWhatsAppUrl(message: string) {
  const base = env.whatsappNumber
    ? `https://wa.me/${env.whatsappNumber}`
    : "https://wa.me/"

  return `${base}?text=${encodeURIComponent(message)}`
}
