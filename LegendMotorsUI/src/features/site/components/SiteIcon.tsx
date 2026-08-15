export type SiteIconName = "arrow" | "arrowLong" | "battery" | "calendar" | "chevron" | "close" | "engine" | "filter" | "fuel" | "info" | "inspection" | "menu" | "mileage" | "payment" | "power" | "search" | "shield" | "sparkle" | "specs" | "support" | "transmission" | "turbo" | "whatsapp"

const paths: Record<SiteIconName, React.ReactNode> = {
  arrow: <path d="m9 18 6-6-6-6" />,
  arrowLong: <path d="M19 12H5m6-6-6 6 6 6" />,
  battery: <><rect x="5" y="6" width="14" height="14" rx="2" /><path d="M9 3h6v3M9 11h6M12 8v6" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
  chevron: <path d="m9 18 6-6-6-6" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  engine: <><path d="M5 9h3l2-2h5l2 2h2v8h-2l-2 2H9l-2-2H5Z" /><path d="M3 11v4M19 11h2v4M11 11h4" /></>,
  filter: <><path d="M4 6h16M7 12h10M10 18h4" /><circle cx="8" cy="6" r="1" /><circle cx="15" cy="12" r="1" /></>,
  fuel: <><path d="M6 3h8v18H6zM8 7h4" /><path d="M14 8h2l3 3v7a2 2 0 0 1-4 0v-5" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  inspection: <><path d="m12 3 2 2.2 3-.4.8 2.9 2.7 1.4-1.4 2.7.4 3-2.9.8L12 21l-2.2-2-3 .4-.8-2.9-2.7-1.4 1.4-2.7-.4-3 2.9-.8L9.4 5Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  mileage: <><path d="M4 16a8 8 0 1 1 16 0" /><path d="m12 13 4-4M7 18h10" /></>,
  payment: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M16 15h2" /></>,
  power: <path d="m13 2-8 12h7l-1 8 8-12h-7Z" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  shield: <path d="M12 3 5 6v5c0 4.6 2.9 8 7 10 4.1-2 7-5.4 7-10V6Z" />,
  sparkle: <path d="M12 3c.7 4.1 2.9 6.3 7 7-4.1.7-6.3 2.9-7 7-.7-4.1-2.9-6.3-7-7 4.1-.7 6.3-2.9 7-7Z" />,
  specs: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
  support: <><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><path d="M4 14v3a2 2 0 0 0 2 2h2v-7H6a2 2 0 0 0-2 2ZM20 14v3a2 2 0 0 1-2 2h-2v-7h2a2 2 0 0 1 2 2ZM16 19c-1 2-3 2-5 2" /></>,
  transmission: <><circle cx="6" cy="5" r="2" /><circle cx="18" cy="5" r="2" /><circle cx="12" cy="19" r="2" /><path d="M6 7v5h12V7M12 12v5" /></>,
  turbo: <><circle cx="12" cy="12" r="8" /><path d="M12 4v8l5 3M8 16h8" /></>,
  whatsapp: <><path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4.1A8 8 0 1 1 20 11.6Z" /><path d="M9 8.5c.5 2 2 3.5 4 4l1-1c.3-.3.7-.4 1-.2l1.5.7c.4.2.5.5.4.9-.3 1.2-1.5 2-2.7 2C10.5 15 8 12.6 8 9.3c0-.8.4-1.5 1-1.8Z" /></>,
}

export function SiteIcon({ name, size = 20, className }: { name: SiteIconName; size?: number; className?: string }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
