import { Link } from "react-router-dom"
import { useI18n } from "@/localization/useI18n"

export function NotFoundPage() {
  const { t } = useI18n()

  return (
    <div className="detail-state">
      <span className="site-eyebrow site-eyebrow--dark">404</span>

      <h1>{t("public.notFound.title")}</h1>

      <p>{t("public.notFound.description")}</p>

      <Link className="site-button site-button--dark" to="/">
        {t("public.nav.home")}
      </Link>
    </div>
  )
}