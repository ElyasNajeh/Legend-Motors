type SiteIconName = "arrow" | "chevron" | "close" | "filter" | "fuel" | "menu" | "mileage" | "search" | "transmission" | "whatsapp"

const paths: Record<SiteIconName, React.ReactNode> = {
  arrow: <path d="m9 18 6-6-6-6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  filter: <><path d="M4 6h16M7 12h10M10 18h4" /><circle cx="8" cy="6" r="1" /><circle cx="15" cy="12" r="1" /></>,
  fuel: <><path d="M6 3h8v18H6zM8 7h4" /><path d="M14 8h2l3 3v7a2 2 0 0 1-4 0v-5" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  mileage: <><path d="M4 16a8 8 0 1 1 16 0" /><path d="m12 13 4-4M7 18h10" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  transmission: <><circle cx="6" cy="5" r="2" /><circle cx="18" cy="5" r="2" /><circle cx="12" cy="19" r="2" /><path d="M6 7v5h12V7M12 12v5" /></>,
  whatsapp: <><path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4.1A8 8 0 1 1 20 11.6Z" /><path d="M9 8.5c.5 2 2 3.5 4 4l1-1c.3-.3.7-.4 1-.2l1.5.7c.4.2.5.5.4.9-.3 1.2-1.5 2-2.7 2C10.5 15 8 12.6 8 9.3c0-.8.4-1.5 1-1.8Z" /></>,
}

export function SiteIcon({ name, size = 20, className }: { name: SiteIconName; size?: number; className?: string }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
