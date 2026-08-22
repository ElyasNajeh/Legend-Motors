import { useEffect, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@/shared/query/remoteData";
import { Link, useParams } from "react-router-dom";
import logo from "@/assets/site_assets/logo.webp";
import { useI18n } from "@/localization/useI18n";
import { getAssetUrl } from "@/shared/api/assets";
import {
  CarAssetIcon,
  type CarAssetIconName,
} from "../components/CarAssetIcon";
import { SuggestedCars } from "../components/SuggestedCars";
import { SiteIcon } from "../components/SiteIcon";
import { getFuelTranslationKey } from "../shared/fuel";
import { SiteApi } from "../shared/site.api";
import { getWhatsAppUrl } from "../shared/whatsapp";

export function CarDetailPage() {
  const { carId = "" } = useParams();
  const id = Number(carId);

  const { t, language, formatNumber } = useI18n();

  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [thumbnailsPerPage, setThumbnailsPerPage] = useState(2);

  const swipeStartX = useRef<number | null>(null);
  const thumbnailViewportRef = useRef<HTMLDivElement | null>(null);

  const carQuery = useQuery({
    queryKey: ["public", "car", id],
    queryFn: () => SiteApi.car(id),
    enabled: Number.isInteger(id) && id > 0,
  });

  const car = carQuery.data;
  const imageCount = car?.images.length ?? 0;
  const browserTitle = car
    ? `${language === "ar" ? car.brand.name_ar : car.brand.name_en} ${car.model} ${car.year} | ${t("public.brandName")}`
    : null;

  /*
   * Reset the gallery when navigating directly
   * from one car details page to another.
   */
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setActiveImage(0);
      setLightboxOpen(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [id]);

  useEffect(() => {
    if (!browserTitle) return;

    document.title = browserTitle;

    return () => {
      document.title = t("public.brandName");
    };
  }, [browserTitle, t]);

  useEffect(() => {
    const viewport = thumbnailViewportRef.current;

    if (!viewport || imageCount <= 1) return;

    const updateThumbnailsPerPage = (width: number) => {
      if (width < 300) {
        setThumbnailsPerPage(2);
      } else if (width < 520) {
        setThumbnailsPerPage(3);
      } else if (width < 760) {
        setThumbnailsPerPage(4);
      } else {
        setThumbnailsPerPage(5);
      }
    };

    updateThumbnailsPerPage(viewport.getBoundingClientRect().width);

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (entry) {
        updateThumbnailsPerPage(entry.contentRect.width);
      }
    });

    resizeObserver.observe(viewport);

    return () => resizeObserver.disconnect();
  }, [imageCount]);

  /*
   * Fullscreen gallery:
   * - Escape closes
   * - Right arrow = next image
   * - Left arrow = previous image
   * - Disable page scrolling while open
   */
  useEffect(() => {
    if (!lightboxOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxOpen(false);
        return;
      }

      if (imageCount <= 1) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();

        setActiveImage((current) => {
          return (current + 1) % imageCount;
        });
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();

        setActiveImage((current) => {
          return (current - 1 + imageCount) % imageCount;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen, imageCount]);

  if (!Number.isInteger(id) || id <= 0 || carQuery.isError) {
    return (
      <DetailState
        title={t("public.detail.errorTitle")}
        description={t("public.detail.errorDescription")}
      />
    );
  }

  if (carQuery.isPending || !car) {
    return (
      <div className="detail-state">
        <span className="site-loader" />
        <p>{t("public.detail.loading")}</p>
      </div>
    );
  }

  /*
   * Protect against activeImage temporarily pointing outside
   * the images array if the route/car changes.
   */
  const safeActiveImage =
    car.images.length > 0 ? Math.min(activeImage, car.images.length - 1) : 0;

  const image = car.images[safeActiveImage];

  const brand = language === "ar" ? car.brand.name_ar : car.brand.name_en;

  const name = `${brand} ${car.model}`;

  const description =
    language === "ar"
      ? car.description_ar || car.description_en
      : car.description_en || car.description_ar;

  const message = t("public.detail.whatsappMessage", {
    name,
    year: car.year,
    url: window.location.href,
  });

  const whatsAppUrl = getWhatsAppUrl(message);

  const fuelKey = getFuelTranslationKey(car.fuel_type);

  const fuel = fuelKey ? t(`public.fuels.${fuelKey}`) : car.fuel_type;

  /*
   * Small accessibility strings.
   * You can move these into your i18n files later if you want.
   */
  const galleryText =
    language === "ar"
      ? {
          open: "فتح الصورة بالحجم الكامل",
          close: "إغلاق معرض الصور",
          previous: "الصورة السابقة",
          next: "الصورة التالية",
          previousThumbnails: "مجموعة الصور السابقة",
          nextThumbnails: "مجموعة الصور التالية",
        }
      : {
          open: "Open image fullscreen",
          close: "Close image gallery",
          previous: "Previous image",
          next: "Next image",
          previousThumbnails: "Previous thumbnails",
          nextThumbnails: "Next thumbnails",
        };

  const goToImage = (direction: number) => {
    if (car.images.length <= 1) return;

    setActiveImage((current) => {
      return (current + direction + car.images.length) % car.images.length;
    });
  };

  const thumbnailPage = Math.floor(safeActiveImage / thumbnailsPerPage);
  const thumbnailStart = thumbnailPage * thumbnailsPerPage;
  const visibleThumbnails = car.images.slice(
    thumbnailStart,
    thumbnailStart + thumbnailsPerPage,
  );

  const goToAdjacentThumbnail = (direction: number) => {
    setActiveImage((current) =>
      Math.min(Math.max(current + direction, 0), car.images.length - 1),
    );
  };

  const openLightbox = () => {
    if (!image) return;
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const handleMainImageKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLightbox();
    }
  };

  /*
   * Mobile swipe support.
   */
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    swipeStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const startX = swipeStartX.current;
    const endX = event.changedTouches[0]?.clientX;

    swipeStartX.current = null;

    if (startX === null || endX === undefined || car.images.length <= 1) {
      return;
    }

    const distance = endX - startX;

    /*
     * Require a reasonable swipe distance so normal taps
     * don't accidentally change the image.
     */
    if (Math.abs(distance) < 55) return;

    if (distance < 0) {
      goToImage(1);
    } else {
      goToImage(-1);
    }
  };

  return (
    <article className="car-detail">
      <div className="public-container car-detail__container car-detail__crumb">
        <Link to="/#cars">
          <SiteIcon name="arrow" />
          {t("public.actions.backToCars")}
        </Link>
      </div>

      <div className="public-container car-detail__container car-detail__grid">
        <section
          className="car-gallery"
          aria-label={t("public.detail.galleryLabel", { name })}
        >
          <div
            className={`car-gallery__main${image ? " has-image" : ""}`}
            onClick={image ? openLightbox : undefined}
            onKeyDown={image ? handleMainImageKeyDown : undefined}
            role={image ? "button" : undefined}
            tabIndex={image ? 0 : undefined}
            aria-haspopup={image ? "dialog" : undefined}
            aria-label={image ? galleryText.open : undefined}
          >
            {image ? (
              <img
                src={getAssetUrl(image.image)}
                alt={t("public.detail.imageAlt", {
                  name,
                  number: safeActiveImage + 1,
                })}
                draggable={false}
              />
            ) : (
              <div className="car-gallery__empty">
                <img src={logo} alt="" />
                <span>{t("public.cars.noImage")}</span>
              </div>
            )}

            {car.is_featured && (
              <span className="car-card__featured">
                <span>{t("public.cars.featured")}</span>
                <SiteIcon name="sparkle" />
              </span>
            )}

            {car.is_bought && (
              <span className="car-card__bought">
                <CarAssetIcon name="bought" />
                <span>{t("public.cars.bought")}</span>
              </span>
            )}

            {car.images.length > 1 && (
              <div className="car-gallery__count">
                {formatNumber(safeActiveImage + 1)}
                {" / "}
                {formatNumber(car.images.length)}
              </div>
            )}
          </div>

          {car.images.length > 1 && (
            <div className="car-gallery__thumbs">
              <button
                className="car-gallery__thumb-nav car-gallery__thumb-nav--previous"
                type="button"
                onClick={() => goToAdjacentThumbnail(-1)}
                disabled={safeActiveImage === 0}
                aria-label={galleryText.previousThumbnails}
              >
                <span aria-hidden="true">‹</span>
              </button>

              <div
                className="car-gallery__thumbs-viewport"
                ref={thumbnailViewportRef}
              >
                <div
                  className="car-gallery__thumbs-grid"
                  style={{
                    gridTemplateColumns: `repeat(${thumbnailsPerPage}, minmax(0, 1fr))`,
                  }}
                >
                  {visibleThumbnails.map((item, visibleIndex) => {
                    const index = thumbnailStart + visibleIndex;

                    return (
                      <button
                        className={
                          index === safeActiveImage
                            ? "car-gallery__thumb is-active"
                            : "car-gallery__thumb"
                        }
                        type="button"
                        key={item.id}
                        onClick={() => setActiveImage(index)}
                        aria-label={t("public.detail.imageAlt", {
                          name,
                          number: index + 1,
                        })}
                        aria-pressed={index === safeActiveImage}
                      >
                        <img
                          src={getAssetUrl(item.image)}
                          alt=""
                          loading="lazy"
                          draggable={false}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                className="car-gallery__thumb-nav car-gallery__thumb-nav--next"
                type="button"
                onClick={() => goToAdjacentThumbnail(1)}
                disabled={safeActiveImage >= car.images.length - 1}
                aria-label={galleryText.nextThumbnails}
              >
                <span aria-hidden="true">›</span>
              </button>
            </div>
          )}
        </section>

        <section className="car-detail__info">
          <div className="car-detail__identity">
            <span className="car-detail__brand">{brand}</span>

            <h1>
              <bdi dir="auto">
                {car.model} {car.year}
              </bdi>
            </h1>
          </div>

          <div className="car-detail__quick">
            <QuickSpec
              icon="mileage"
              label={t("public.detail.mileage")}
              value={t("public.cars.mileage", {
                count: formatNumber(car.mileage),
              })}
            />

            <QuickSpec
              icon="transmission"
              label={t("public.detail.transmission")}
              value={t(`public.transmissions.${car.transmission}`)}
            />

            <QuickSpec
              icon="fuel"
              label={t("public.detail.fuel")}
              value={fuel}
            />
          </div>

          {car.is_bought ? (
            <div className="car-detail__bought car-detail__whatsapp">
              <CarAssetIcon name="bought" />
              {t("public.detail.bought")}
            </div>
          ) : (
            <a
              className="public-whatsapp car-detail__whatsapp"
              href={whatsAppUrl}
              target="_blank"
              rel="noreferrer"
            >
              <SiteIcon name="whatsapp" size={22} />
              {t("public.detail.whatsapp")}
            </a>
          )}

          <section className="car-detail__description">
            <h2>
              <SiteIcon name="info" />
              {t("public.detail.description")}
            </h2>

            <p>{description || t("public.detail.noDescription")}</p>
          </section>

          <section className="car-specs">
            <h2>
              <SiteIcon name="specs" />
              {t("public.detail.specs")}
            </h2>

            <dl>
              <DetailSpec
                icon={<CarAssetIcon name="year" />}
                label={t("public.detail.year")}
                value={String(car.year)}
              />

              <DetailSpec
                icon={<CarAssetIcon name="mileage" />}
                label={t("public.detail.mileage")}
                value={t("public.cars.mileage", {
                  count: formatNumber(car.mileage),
                })}
              />

              <DetailSpec
                icon={<CarAssetIcon name="fuel" />}
                label={t("public.detail.fuel")}
                value={fuel}
              />

              <DetailSpec
                icon={<CarAssetIcon name="transmission" />}
                label={t("public.detail.transmission")}
                value={t(`public.transmissions.${car.transmission}`)}
              />

              <DetailSpec
                icon={<SiteIcon name="power" />}
                label={t("public.detail.horsepower")}
                value={`${formatNumber(car.horsepower)} HP`}
              />

              <DetailSpec
                icon={<CarAssetIcon name="engine" />}
                label={t("public.detail.engine")}
                value={
                  car.is_turbo
                    ? `${formatNumber(car.engine_cc)} cc`
                    : formatNumber(car.engine_cc)
                }
              />

              {car.hybrid_car?.battery_capacity && (
                <DetailSpec
                  icon={<SiteIcon name="battery" />}
                  label={t("public.detail.battery")}
                  value={car.hybrid_car.battery_capacity}
                />
              )}
            </dl>

            {car.is_turbo && (
              <div className="car-specs__turbo">
                <span className="car-specs__turbo-icon">
                  <CarAssetIcon name="turbo" />
                </span>
                <strong>{t("public.detail.turbo")}</strong>
              </div>
            )}
          </section>
        </section>
      </div>

      <SuggestedCars currentCar={car} />

      <section
        className="public-container car-detail__container car-trust"
        aria-label={t("public.detail.trustLabel")}
      >
        <TrustItem
          icon="warranty"
          title={t("public.detail.trustWarrantyTitle")}
          description={t("public.detail.trustWarrantyText")}
        />

        <TrustItem
          icon="inspection"
          title={t("public.detail.trustInspectionTitle")}
          description={t("public.detail.trustInspectionText")}
        />

        <TrustItem
          icon="payment"
          title={t("public.detail.trustPaymentTitle")}
          description={t("public.detail.trustPaymentText")}
        />

        <TrustItem
          icon="support"
          title={t("public.detail.trustSupportTitle")}
          description={t("public.detail.trustSupportText")}
        />
      </section>

      <div className="car-detail__mobile-whatsapp">
        {car.is_bought ? (
          <div className="car-detail__bought car-detail__mobile-whatsapp-button">
            <CarAssetIcon name="bought" />
            {t("public.detail.bought")}
          </div>
        ) : (
          <a
            className="public-whatsapp car-detail__mobile-whatsapp-button"
            href={whatsAppUrl}
            target="_blank"
            rel="noreferrer"
          >
            <SiteIcon name="whatsapp" size={15} />
            {t("public.detail.whatsapp")}
          </a>
        )}
      </div>

      {/* FULLSCREEN IMAGE VIEWER */}
      {lightboxOpen && image && (
        <div
          className="car-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={t("public.detail.galleryLabel", {
            name,
          })}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeLightbox();
            }
          }}
        >
          <button
            type="button"
            className="car-lightbox__close"
            onClick={closeLightbox}
            aria-label={galleryText.close}
            autoFocus
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M6 6 18 18M18 6 6 18" />
            </svg>
          </button>

          {car.images.length > 1 && (
            <>
              <button
                type="button"
                className="car-lightbox__nav car-lightbox__nav--previous"
                onClick={() => goToImage(-1)}
                aria-label={galleryText.previous}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="m15 5-7 7 7 7" />
                </svg>
              </button>

              <button
                type="button"
                className="car-lightbox__nav car-lightbox__nav--next"
                onClick={() => goToImage(1)}
                aria-label={galleryText.next}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="m9 5 7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div
            className="car-lightbox__stage"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              key={image.id}
              src={getAssetUrl(image.image)}
              alt={t("public.detail.imageAlt", {
                name,
                number: safeActiveImage + 1,
              })}
              draggable={false}
            />

            {car.images.length > 1 && (
              <div className="car-lightbox__count">
                {formatNumber(safeActiveImage + 1)}
                {" / "}
                {formatNumber(car.images.length)}
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function QuickSpec({
  icon,
  label,
  value,
}: {
  icon: CarAssetIconName;
  label: string;
  value: string;
}) {
  return (
    <div>
      <CarAssetIcon name={icon} />
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

function DetailSpec({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt>
        {icon}
        <span>{label}</span>
      </dt>
      <dd>{value}</dd>
    </div>
  );
}

function TrustItem({
  icon,
  title,
  description,
}: {
  icon: CarAssetIconName;
  title: string;
  description: string;
}) {
  return (
    <div className="car-trust__item">
      <CarAssetIcon name={icon} />

      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
    </div>
  );
}

function DetailState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const { t } = useI18n();

  return (
    <div className="detail-state">
      <h1>{title}</h1>
      <p>{description}</p>

      <Link className="site-button site-button--dark" to="/#cars">
        {t("public.actions.backToCars")}
      </Link>
    </div>
  );
}
