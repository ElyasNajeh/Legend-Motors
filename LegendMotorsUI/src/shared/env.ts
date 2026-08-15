export const env = {
  apiUrl: import.meta.env.VITE_API_URL?.trim() || "http://localhost:8000",
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER?.replace(/\D/g, "") || "",
}
