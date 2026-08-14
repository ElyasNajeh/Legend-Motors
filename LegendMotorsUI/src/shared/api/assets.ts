import { env } from "../env"

export function getAssetUrl(value: string) {
  if (!value || /^(data:|blob:|https?:\/\/)/i.test(value)) return value
  return `${env.apiUrl.replace(/\/$/, "")}/${value.replace(/^\//, "")}`
}
