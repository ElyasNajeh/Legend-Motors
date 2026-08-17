import { env } from "../env";

export function getAssetUrl(value: string) {
  if (!value || /^(data:|blob:|https?:\/\/)/i.test(value)) return value;

  const path = `/${value.replace(/^\//, "")}`;

  if (import.meta.env.DEV && path.startsWith("/uploads/")) return path;

  return `${env.apiUrl.replace(/\/$/, "")}${path}`;
}
