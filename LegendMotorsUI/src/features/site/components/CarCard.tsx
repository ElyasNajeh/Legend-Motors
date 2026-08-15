import { Link } from "react-router-dom"
import { getAssetUrl } from "@/shared/api/assets"
import { useI18n } from "@/localization/useI18n"
import type { PublicCar } from "../site.types"
import { SiteIcon } from "./SiteIcon"

export function CarCard({ car }: { car: PublicCar }) {
  const { t, language, formatNumber } = useI18n()
  const brand = language === "ar" ? car.brand.name_ar : car.brand.name_en
  const name = `${brand} ${car.model}`
  const cover = car.images[0]?.image

  return <Link className="car-card" to={`/cars/${car.id}`} aria-label={`${t("public.actions.details")}: ${car.year} ${name}`}>
    <div className="car-card__image">
      {cover ? <img src={getAssetUrl(cover)} alt={`${car.year} ${name}`} loading="lazy" /> : <div className="car-card__placeholder"><SiteIcon name="mileage" size={34} /><span>{t("public.cars.noImage")}</span></div>}
      {car.is_featured && <span className="car-card__featured">{t("public.cars.newest")}</span>}
    </div>
    <div className="car-card__body">
      <span className="car-card__year">{formatNumber(car.year)}</span>
      <h3>{name}</h3>
      <div className="car-card__specs">
        <span><SiteIcon name="mileage" />{t("public.cars.mileage", { count: formatNumber(car.mileage) })}</span>
        <span><SiteIcon name="transmission" />{t(`public.transmissions.${car.transmission}`)}</span>
        <span><SiteIcon name="fuel" />{car.fuel_type}</span>
      </div>
      <span className="car-card__link">{t("public.actions.details")}<SiteIcon name="arrow" /></span>
    </div>
  </Link>
}
