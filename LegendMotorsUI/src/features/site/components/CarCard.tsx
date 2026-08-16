import { Link } from "react-router-dom";
import { getAssetUrl } from "@/shared/api/assets";
import { useI18n } from "@/localization/useI18n";
import { getFuelTranslationKey } from "../fuel";
import type { PublicCar } from "../site.types";
import { CarAssetIcon } from "./CarAssetIcon";
import { SiteIcon } from "./SiteIcon";

export function CarCard({
  car,
  recommendationLabel,
}: {
  car: PublicCar;
  recommendationLabel?: string;
}) {
  const { t, language, formatNumber } = useI18n();
  const brand = language === "ar" ? car.brand.name_ar : car.brand.name_en;
  const name = `${brand} ${car.model}`;
  const cover = car.images[0]?.image;
  const fuelKey = getFuelTranslationKey(car.fuel_type);
  const fuel = fuelKey ? t(`public.fuels.${fuelKey}`) : car.fuel_type;

  return (
    <Link
      className="car-card"
      to={`/cars/${car.id}`}
      aria-label={[
        `${t("public.actions.details")}: ${car.year} ${name}`,
        recommendationLabel,
      ]
        .filter(Boolean)
        .join(". ")}
    >
      <div className="car-card__image">
        {cover ? (
          <img
            src={getAssetUrl(cover)}
            alt={`${car.year} ${name}`}
            loading="lazy"
          />
        ) : (
          <div className="car-card__placeholder">
            <SiteIcon name="mileage" size={34} />
            <span>{t("public.cars.noImage")}</span>
          </div>
        )}

        {car.is_featured && (
          <span className="car-card__featured">
            <span>{t("public.cars.featured")}</span>
            <SiteIcon name="sparkle" />
          </span>
        )}

        {recommendationLabel && (
          <span className="car-card__recommendation">
            <SiteIcon name="sparkle" />
            <span>{recommendationLabel}</span>
          </span>
        )}
      </div>

      <div className="car-card__body">
        <header className="car-card__heading">
          <span className="car-card__manufacturer">{brand}</span>

          <div
            className={`car-card__title-row${car.is_turbo ? " has-turbo" : ""}`}
          >
            {car.is_turbo && (
              <CarAssetIcon name="cc" className="car-card__turbo-icon" />
            )}

            <h3>
              <bdi>{car.model}</bdi> <bdi>{car.year}</bdi>
            </h3>
          </div>
        </header>

        <div className="car-card__specs">
          <span className="car-card__spec">
            <CarAssetIcon name="mileage" />
            <strong>
              {t("public.cars.mileage", {
                count: formatNumber(car.mileage),
              })}
            </strong>
            <small>{t("public.cars.mileageLabel")}</small>
          </span>

          <span className="car-card__spec">
            <CarAssetIcon name="transmission" />
            <strong>{t(`public.transmissions.${car.transmission}`)}</strong>
            <small>{t("public.cars.transmission")}</small>
          </span>

          <span className="car-card__spec">
            <CarAssetIcon name="fuel" />
            <strong>{fuel}</strong>
            <small>{t("public.cars.fuel")}</small>
          </span>
        </div>

        <span className="car-card__link">
          <span>{t("public.actions.details")}</span>

          <span className="car-card__link-icon">
            <SiteIcon name="arrowLong" />
          </span>
        </span>
      </div>
    </Link>
  );
}
