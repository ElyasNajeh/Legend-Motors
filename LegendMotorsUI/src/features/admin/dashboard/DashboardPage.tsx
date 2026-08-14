import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/features/admin/Auth/AuthProvider"
import { DashboardApi, type DashboardStats } from "./dashboard.api"
import { getRandomHadith, type Hadith } from "./hadith.api"
import { PageHeader } from "@/shared/components/AdminComponents"
import { Icon, type IconName } from "@/shared/components/Icon"
import { queryKeys } from "@/shared/query/queryClient"
import helloWaveIcon from "@/assets/dashboard_assets/hello-wave-icon.png"
import { useI18n } from "@/localization/useI18n"
import { getLocalizedErrorMessage } from "@/shared/api/error"

const STAT_CARDS: Array<{ labelKey: string; key: keyof DashboardStats; icon: IconName }> = [
  { labelKey: "admin.stats.totalCars", key: "cars", icon: "cars" },
  { labelKey: "admin.stats.hybridCars", key: "hybrid_cars", icon: "hybrid" },
  { labelKey: "admin.stats.normalCars", key: "normal_cars", icon: "normalCar" },
  { labelKey: "admin.brands", key: "brands", icon: "brands" },
]

export function DashboardPage() {
  const { user } = useAuth()
  const { t, language } = useI18n()
  const statsQuery = useQuery({ queryKey: queryKeys.dashboardStats, queryFn: DashboardApi.stats })
  const [hadith, setHadith] = useState<Hadith | null>(null)
  const [hadithFailed, setHadithFailed] = useState(false)

  useEffect(() => {
    getRandomHadith().then(setHadith).catch(() => setHadithFailed(true))
  }, [])

  const adminName = user?.email.split("@")[0] ?? "Admin"
  const error = statsQuery.error ? getLocalizedErrorMessage(statsQuery.error, language, t("admin.pages.dashboardError")) : ""

  return (
    <section>
      <PageHeader
        eyebrow={t("admin.pages.dashboardEyebrow")}
        title={<span className="welcome-title">{t("admin.pages.welcome", { name: adminName })}<img src={helloWaveIcon} alt="" aria-hidden="true" /></span>}
        description={t("admin.pages.dashboardDescription")}
      />
      {error ? <div className="error-state"><p>{error}</p></div> : (
        <div className="stats-grid">
          {STAT_CARDS.map((card) => (
            <article className={`stat-card stat-card--${card.key}`} key={card.key}>
              <span><Icon name={card.icon} /></span>
              <div><small>{t(card.labelKey)}</small><strong>{statsQuery.data?.[card.key] ?? "—"}</strong></div>
            </article>
          ))}
        </div>
      )}
      <HadithCard hadith={hadith} failed={hadithFailed} />
    </section>
  )
}

function HadithCard({ hadith, failed }: { hadith: Hadith | null; failed: boolean }) {
  let content = <p>جارٍ تحميل الحديث…</p>
  if (hadith) content = <><blockquote>{hadith.arabic}</blockquote>{hadith.source && <small>{hadith.source}</small>}</>
  else if (failed) content = <p>تعذّر تحميل الحديث اليوم. يمكنك متابعة إدارة النظام بشكل طبيعي.</p>
  return <article className="hadith-card" dir="rtl"><span>حديث اليوم</span>{content}</article>
}
