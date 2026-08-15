import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useParams } from "react-router-dom"
import logo from "@/assets/site_assets/logo.webp"
import { useI18n } from "@/localization/useI18n"
import { getAssetUrl } from "@/shared/api/assets"
import { SiteIcon } from "./components/SiteIcon"
import { SiteApi } from "./site.api"
import { getWhatsAppUrl } from "./whatsapp"

export function CarDetailPage() {
  const { carId = "" } = useParams()
  const id = Number(carId)
  const { t, language, formatNumber } = useI18n()
  const [activeImage, setActiveImage] = useState(0)
  const carQuery = useQuery({ queryKey: ["public", "car", id], queryFn: () => SiteApi.car(id), enabled: Number.isInteger(id) && id > 0 })
  const car = carQuery.data

  if (!Number.isInteger(id) || id <= 0 || carQuery.isError) {
    return <DetailState title={t("public.detail.errorTitle")} description={t("public.detail.errorDescription")} />
  }
  if (carQuery.isPending || !car) {
    return <div className="detail-state"><span className="site-loader" /><p>{t("public.detail.loading")}</p></div>
  }

  const brand = language === "ar" ? car.brand.name_ar : car.brand.name_en
  const name = `${brand} ${car.model}`
  const description = language === "ar" ? car.description_ar || car.description_en : car.description_en || car.description_ar
  const message = t("public.detail.whatsappMessage", { name, year: car.year, id: car.id, url: window.location.href })
  const whatsAppUrl = getWhatsAppUrl(message)
  const image = car.images[activeImage]

  return <article className="car-detail">
    <div className="public-container car-detail__crumb"><Link to="/#cars"><SiteIcon name="arrow" />{t("public.actions.backToCars")}</Link><span>{t("public.detail.carId", { id: formatNumber(car.id) })}</span></div>
    <div className="public-container car-detail__grid">
      <section className="car-gallery" aria-label={t("public.detail.galleryLabel", { name })}>
        <div className="car-gallery__main">
          {image ? <img src={getAssetUrl(image.image)} alt={t("public.detail.imageAlt", { name, number: activeImage + 1 })} /> : <div className="car-gallery__empty"><img src={logo} alt="" /><span>{t("public.cars.noImage")}</span></div>}
          {car.images.length > 1 && <div className="car-gallery__count">{formatNumber(activeImage + 1)} / {formatNumber(car.images.length)}</div>}
        </div>
        {car.images.length > 1 && <div className="car-gallery__thumbs">{car.images.map((item, index) => <button className={index === activeImage ? "is-active" : ""} type="button" key={item.id} onClick={() => setActiveImage(index)} aria-label={t("public.detail.imageAlt", { name, number: index + 1 })}><img src={getAssetUrl(item.image)} alt="" loading="lazy" /></button>)}</div>}
      </section>

      <section className="car-detail__info">
        <span className="site-eyebrow site-eyebrow--dark">{t("public.detail.carId", { id: formatNumber(car.id) })}</span>
        <h1><small>{formatNumber(car.year)}</small>{name}</h1>
        <div className="car-detail__quick"><span><SiteIcon name="mileage" />{t("public.cars.mileage", { count: formatNumber(car.mileage) })}</span><span><SiteIcon name="transmission" />{t(`public.transmissions.${car.transmission}`)}</span><span><SiteIcon name="fuel" />{car.fuel_type}</span></div>
        <a className="public-whatsapp car-detail__whatsapp" href={whatsAppUrl} target="_blank" rel="noreferrer"><SiteIcon name="whatsapp" size={22} />{t("public.detail.whatsapp")}</a>

        <div className="car-detail__description"><h2>{t("public.detail.description")}</h2><p>{description || t("public.detail.noDescription")}</p></div>
        <div className="car-specs"><h2>{t("public.detail.specs")}</h2><dl>
          <Spec label={t("public.detail.year")} value={formatNumber(car.year)} />
          <Spec label={t("public.detail.mileage")} value={t("public.cars.mileage", { count: formatNumber(car.mileage) })} />
          <Spec label={t("public.detail.fuel")} value={car.fuel_type} />
          <Spec label={t("public.detail.transmission")} value={t(`public.transmissions.${car.transmission}`)} />
          <Spec label={t("public.detail.horsepower")} value={`${formatNumber(car.horsepower)} HP`} />
          <Spec label={t("public.detail.engine")} value={`${formatNumber(car.engine_cc)} cc`} />
          <Spec label={t("public.detail.turbo")} value={t(car.is_turbo ? "public.detail.yes" : "public.detail.no")} />
          {car.hybrid_car?.battery_capacity && <Spec label={t("public.detail.battery")} value={car.hybrid_car.battery_capacity} />}
        </dl></div>
      </section>
    </div>
    <div className="car-detail__mobile-action"><a className="public-whatsapp" href={whatsAppUrl} target="_blank" rel="noreferrer"><SiteIcon name="whatsapp" />{t("public.detail.whatsapp")}</a></div>
  </article>
}

function Spec({ label, value }: { label: string; value: string }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>
}

function DetailState({ title, description }: { title: string; description: string }) {
  const { t } = useI18n()
  return <div className="detail-state"><h1>{title}</h1><p>{description}</p><Link className="site-button site-button--dark" to="/#cars">{t("public.actions.backToCars")}</Link></div>
}
