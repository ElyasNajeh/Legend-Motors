import adminIcon from "@/assets/dashboard_assets/admin-icon.png"
import brandIcon from "@/assets/dashboard_assets/brand-icon.png"
import carsIcon from "@/assets/dashboard_assets/cars-icon.png"
import dashboardIcon from "@/assets/dashboard_assets/dashboard-icon.png"
import hybridIcon from "@/assets/dashboard_assets/hybrid-icon.png"
import normalCarIcon from "@/assets/dashboard_assets/normal-car-icon.png"
import slidersIcon from "@/assets/dashboard_assets/sliders-icon.png"

export type IconName = "dashboard" | "cars" | "brands" | "hybrid" | "normalCar" | "sliders" | "admins" | "settings" | "sun" | "moon" | "logout" | "menu" | "search" | "edit" | "eye" | "eyeOff" | "trash" | "close" | "plus" | "arrow" | "store" | "check" | "alert" | "info"

const imageIcons: Partial<Record<IconName, string>> = {
  dashboard: dashboardIcon,
  cars: carsIcon,
  brands: brandIcon,
  hybrid: hybridIcon,
  normalCar: normalCarIcon,
  sliders: slidersIcon,
  admins: adminIcon,
}

const paths: Record<IconName, React.ReactNode> = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
  cars: <><path d="M3 14l2-5h14l2 5v5h-2v2h-3v-2H8v2H5v-2H3v-5Z"/><path d="M5 14h14M7 16h.01M17 16h.01M8 9l1-3h6l1 3"/></>,
  brands: <><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/></>,
  hybrid: <><path d="M13 2 6 13h6l-1 9 7-12h-6l1-8Z"/></>,
  normalCar: <><path d="M3 14l2-5h14l2 5v5h-2v2h-3v-2H8v2H5v-2H3v-5Z"/></>,
  sliders: <><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="8" cy="18" r="2"/></>,
  admins: <><circle cx="9" cy="8" r="4"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M17 8h4M19 6v4"/></>, settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1V21H9.6v-.1A1.7 1.7 0 0 0 8.5 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1-.4H3V9.6h.1A1.7 1.7 0 0 0 4.6 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1V3h4v.1A1.7 1.7 0 0 0 15.5 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.2.4.6.8 1 1 .3.2.7.3 1 .3h.1v4h-.1c-.8 0-1.5.4-2 1Z"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/></>,
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></>, menu: <path d="M4 6h16M4 12h16M4 18h16"/>, search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>, edit: <><path d="m4 20 4-1 11-11-3-3L5 16l-1 4Z"/><path d="m14 7 3 3"/></>, eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>, eyeOff: <><path d="m3 3 18 18M10.6 5.2A10.4 10.4 0 0 1 12 5c6 0 10 7 10 7a18 18 0 0 1-2.2 3.1M6.6 6.6C3.8 8.5 2 12 2 12s4 7 10 7a9.7 9.7 0 0 0 4.1-.9"/></>, trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/></>, close: <path d="m6 6 12 12M18 6 6 18"/>, plus: <path d="M12 5v14M5 12h14"/>, arrow: <path d="m9 18 6-6-6-6"/>, store: <><path d="M4 10v10h16V10M3 10l2-6h14l2 6"/><path d="M8 20v-6h8v6"/></>, check: <path d="m5 12 4 4L19 6"/>, alert: <><path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5M12 18h.01"/></>, info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></>,
}

export function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  const image = imageIcons[name]
  if (image) {
    return <img className={`asset-icon${className ? ` ${className}` : ""}`} src={image} width={size} height={size} alt="" aria-hidden="true" />
  }

  const svgClassName = [className, name === "arrow" || name === "logout" ? "directional-arrow" : ""].filter(Boolean).join(" ")
  return <svg className={svgClassName || undefined} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
