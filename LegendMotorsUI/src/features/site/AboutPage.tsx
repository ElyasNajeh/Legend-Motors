import { Link } from "react-router-dom"
import hero from "@/assets/site_assets/hero_2.webp"
import { useI18n } from "@/localization/useI18n"
import { SiteIcon } from "./components/SiteIcon"

export function AboutPage() {
  const { t } = useI18n()
  const values = [
    ["public.about.valueOneTitle", "public.about.valueOneText"],
    ["public.about.valueTwoTitle", "public.about.valueTwoText"],
    ["public.about.valueThreeTitle", "public.about.valueThreeText"],
  ]

  return (
    <div className="content-page">
      <section className="content-hero">
        <img src={hero} alt="" />
        <div className="content-hero__shade" />

        <div className="public-container">
          <span className="site-eyebrow">
            {t("public.about.eyebrow")}
          </span>

          <h1>{t("public.about.title")}</h1>
        </div>
      </section>

      <section className="public-container content-page__body">
        <div className="content-page__lead">
          <p>{t("public.about.lead")}</p>
          <p>{t("public.about.detail")}</p>

          <Link className="site-button site-button--dark" to="/#cars">
            {t("public.actions.browse")}
            <SiteIcon name="arrow" />
          </Link>
        </div>

        <div className="value-grid">
          {values.map(([title, text], index) => (
            <article key={title}>
              <span>0{index + 1}</span>
              <h2>{t(title)}</h2>
              <p>{t(text)}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}