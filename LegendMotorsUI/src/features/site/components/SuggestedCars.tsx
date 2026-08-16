import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/localization/useI18n";
import { useQuery } from "@/shared/query/remoteData";
import { SiteApi } from "../site.api";
import type { PublicCar } from "../site.types";
import { CarCard } from "./CarCard";
import { SiteIcon } from "./SiteIcon";

type RecommendationReason =
  | "sameBrand"
  | "similarSpecs"
  | "sameFuel"
  | "sameTransmission"
  | "closeYear"
  | "lowerMileage"
  | "featured"
  | "otherOption";

type SuggestedCar = {
  car: PublicCar;
  reason: RecommendationReason;
  score: number;
};

const RECOMMENDATION_LIMIT = 6;
const RECOMMENDATION_SHARE = 0.6;

export function SuggestedCars({ currentCar }: { currentCar: PublicCar }) {
  const { t } = useI18n();

  const carsQuery = useQuery({
    queryKey: ["public", "cars"],
    queryFn: SiteApi.cars,
  });

  const inventory = carsQuery.data ?? [];
  const activeCarCount = inventory.filter((car) => car.is_active).length;
  const suggestionLimit = Math.min(
    RECOMMENDATION_LIMIT,
    Math.floor(activeCarCount * RECOMMENDATION_SHARE),
  );

  const suggestions = getSuggestedCars(currentCar, inventory, suggestionLimit);

  return (
    <section
      className="car-suggestions"
      aria-labelledby="car-suggestions-title"
      aria-busy={carsQuery.isPending}
    >
      <div className="public-container car-detail__container">
        <div className="car-suggestions__heading">
          <div>
            <span className="site-eyebrow site-eyebrow--dark">
              {t("public.detail.suggestionsEyebrow")}
            </span>
            <h2 id="car-suggestions-title">
              {t("public.detail.suggestionsTitle")}
            </h2>
            <p>{t("public.detail.suggestionsDescription")}</p>
          </div>

          {!carsQuery.isPending &&
            !carsQuery.isError &&
            suggestions.length > 0 && (
              <Link className="site-button site-button--dark" to="/#cars">
                {t("public.detail.suggestionsAllCars")}
                <SiteIcon name="arrowLong" />
              </Link>
            )}
        </div>

        {carsQuery.isPending ? (
          <SuggestionState title={t("public.detail.suggestionsLoading")} live>
            <span className="site-loader" />
          </SuggestionState>
        ) : carsQuery.isError ? (
          <SuggestionState title={t("public.detail.suggestionsError")} live>
            <button
              className="site-button site-button--dark"
              type="button"
              onClick={() => void carsQuery.refetch()}
            >
              {t("public.actions.retry")}
            </button>
          </SuggestionState>
        ) : suggestions.length > 0 ? (
          <div className="cars-grid car-suggestions__grid">
            {suggestions.map((suggestion) => (
              <CarCard
                car={suggestion.car}
                recommendationLabel={t(
                  `public.detail.suggestionReasons.${suggestion.reason}`,
                )}
                key={suggestion.car.id}
              />
            ))}
          </div>
        ) : (
          <SuggestionState title={t("public.detail.suggestionsEmpty")} live>
            <Link className="site-button site-button--dark" to="/#cars">
              {t("public.detail.suggestionsAllCars")}
            </Link>
          </SuggestionState>
        )}
      </div>
    </section>
  );
}

function SuggestionState({
  title,
  children,
  live = false,
}: {
  title: string;
  children: ReactNode;
  live?: boolean;
}) {
  return (
    <div
      className="cars-state car-suggestions__state"
      role={live ? "status" : undefined}
      aria-live={live ? "polite" : undefined}
    >
      {children}
      <p>{title}</p>
    </div>
  );
}

function getSuggestedCars(
  currentCar: PublicCar,
  inventory: PublicCar[],
  limit: number,
): SuggestedCar[] {
  return inventory
    .filter((car) => car.id !== currentCar.id && car.is_active)
    .map((car) => scoreCar(currentCar, car))
    .sort((first, second) => {
      if (second.score !== first.score) return second.score - first.score;

      if (first.car.is_featured !== second.car.is_featured) {
        return Number(second.car.is_featured) - Number(first.car.is_featured);
      }

      return (
        new Date(second.car.created_at).getTime() -
        new Date(first.car.created_at).getTime()
      );
    })
    .slice(0, limit);
}

function scoreCar(currentCar: PublicCar, candidate: PublicCar): SuggestedCar {
  const sameBrand = candidate.brand_id === currentCar.brand_id;
  const sameType = candidate.car_type === currentCar.car_type;
  const sameFuel = candidate.fuel_type === currentCar.fuel_type;
  const sameTransmission = candidate.transmission === currentCar.transmission;
  const yearDifference = Math.abs(candidate.year - currentCar.year);
  const mileageDifference = Math.abs(candidate.mileage - currentCar.mileage);
  const engineDifference = Math.abs(candidate.engine_cc - currentCar.engine_cc);
  const powerDifference = Math.abs(
    candidate.horsepower - currentCar.horsepower,
  );

  let score = 0;

  if (sameBrand) score += 40;
  if (sameType) score += 20;
  if (sameFuel) score += 14;
  if (sameTransmission) score += 10;
  if (candidate.is_turbo === currentCar.is_turbo) score += 2;
  if (candidate.is_featured) score += 1;

  if (yearDifference <= 1) score += 10;
  else if (yearDifference <= 3) score += 6;
  else if (yearDifference <= 5) score += 2;

  if (mileageDifference <= 15_000) score += 8;
  else if (mileageDifference <= 40_000) score += 4;

  if (engineDifference <= 200) score += 6;
  else if (engineDifference <= 500) score += 3;

  if (powerDifference <= 30) score += 5;
  else if (powerDifference <= 60) score += 2;

  return {
    car: candidate,
    score,
    reason: getRecommendationReason({
      currentCar,
      candidate,
      sameBrand,
      sameFuel,
      sameTransmission,
      sameType,
      yearDifference,
      mileageDifference,
      engineDifference,
      powerDifference,
    }),
  };
}

function getRecommendationReason({
  currentCar,
  candidate,
  sameBrand,
  sameFuel,
  sameTransmission,
  sameType,
  yearDifference,
  mileageDifference,
  engineDifference,
  powerDifference,
}: {
  currentCar: PublicCar;
  candidate: PublicCar;
  sameBrand: boolean;
  sameFuel: boolean;
  sameTransmission: boolean;
  sameType: boolean;
  yearDifference: number;
  mileageDifference: number;
  engineDifference: number;
  powerDifference: number;
}): RecommendationReason {
  if (sameBrand) return "sameBrand";

  const hasSimilarSpecs =
    sameType &&
    yearDifference <= 3 &&
    mileageDifference <= 40_000 &&
    engineDifference <= 500 &&
    powerDifference <= 60;

  if (hasSimilarSpecs) return "similarSpecs";
  if (sameFuel) return "sameFuel";
  if (sameTransmission) return "sameTransmission";
  if (yearDifference <= 2) return "closeYear";
  if (candidate.mileage < currentCar.mileage) return "lowerMileage";
  if (candidate.is_featured) return "featured";

  return "otherOption";
}
