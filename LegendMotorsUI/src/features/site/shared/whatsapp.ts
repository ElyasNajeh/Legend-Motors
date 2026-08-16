import { env } from "@/shared/env"
import { siteContact } from "./contactInfo"

export function getWhatsAppUrl(message: string) {
  const number = env.whatsappNumber || siteContact.whatsappNumber
  const base = `https://wa.me/${number}`

  return `${base}?text=${encodeURIComponent(message)}`
}
