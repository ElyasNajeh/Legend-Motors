import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
  type UIEvent,
} from "react";
import { useQuery } from "@/shared/query/remoteData";
import heroOne from "@/assets/site_assets/hero_1.webp";
import heroTwo from "@/assets/site_assets/hero_2.webp";
import { useI18n } from "@/localization/useI18n";
import { getAssetUrl } from "@/shared/api/assets";
import { CarCard } from "../components/CarCard";
import { FilterSheet } from "../components/FilterSheet";
import { SiteIcon } from "../components/SiteIcon";
import { SiteApi } from "../shared/site.api";
import type { CarType, PublicBrand, Transmission } from "../shared/site.types";

type Filters = {
  brand: string;
  type: "" | CarType;
  fuel: string;
  transmission: "" | Transmission;
  sort: "newest" | "year" | "mileage";
};

const initialFilters: Filters = {
  brand: "",
  type: "",
  fuel: "",
  transmission: "",
  sort: "newest",
};

const SHOWCASE_AUTOPLAY_INTERVAL_MS = 2500;
const SHOWCASE_SCROLL_DURATION_MS = 1400;

export function HomePage() {
  const { t, formatNumber } = useI18n();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentSlideId, setCurrentSlideId] = useState<number | null>(null);
  const sliderViewportRef = useRef<HTMLDivElement | null>(null);
  const currentSlideIdRef = useRef<number | null>(null);
  const autoplayPauseUntilRef = useRef(0);
  const showcaseScrollFrameRef = useRef<number | null>(null);

  const carsQuery = useQuery({
    queryKey: ["public", "cars"],
    queryFn: SiteApi.cars,
  });
  const brandsQuery = useQuery({
    queryKey: ["public", "brands"],
    queryFn: SiteApi.brands,
  });
  const slidersQuery = useQuery({
    queryKey: ["public", "sliders"],
    queryFn: SiteApi.sliders,
  });

  const cars = useMemo(() => carsQuery.data ?? [], [carsQuery.data]);
  const brands = brandsQuery.data ?? [];

  const fuels = useMemo(
    () =>
      Array.from(
        new Set(cars.map((car) => car.fuel_type).filter(Boolean)),
      ).sort(),
    [cars],
  );

  const visibleCars = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();

    const filtered = cars.filter((car) => {
      const names =
        `${car.brand.name_ar} ${car.brand.name_en} ${car.model} ${car.year}`.toLocaleLowerCase();

      return (
        (!term || names.includes(term)) &&
        (!filters.brand || car.brand_id === Number(filters.brand)) &&
        (!filters.type || car.car_type === filters.type) &&
        (!filters.fuel || car.fuel_type === filters.fuel) &&
        (!filters.transmission || car.transmission === filters.transmission)
      );
    });

    return [...filtered].sort((first, second) => {
      if (filters.sort === "year") return second.year - first.year;
      if (filters.sort === "mileage") return first.mileage - second.mileage;

      return (
        new Date(second.created_at).getTime() -
        new Date(first.created_at).getTime()
      );
    });
  }, [cars, filters, search]);

  const hasFilters = Boolean(
    search.trim() ||
      filters.brand ||
      filters.type ||
      filters.fuel ||
      filters.transmission ||
      filters.sort !== "newest",
  );

  const clearFilters = () => {
    setSearch("");
    setFilters(initialFilters);
  };

  const showcaseSlides = useMemo(
    () => slidersQuery.data ?? [],
    [slidersQuery.data],
  );
  const activeSlideId = currentSlideId ?? showcaseSlides[0]?.id ?? null;

  const setActiveShowcaseSlide = (slideId: number) => {
    currentSlideIdRef.current = slideId;
    setCurrentSlideId(slideId);
  };

  const pauseShowcaseAutoplay = () => {
    autoplayPauseUntilRef.current = Date.now() + 3000;

    if (showcaseScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(showcaseScrollFrameRef.current);
      showcaseScrollFrameRef.current = null;
    }

    sliderViewportRef.current?.classList.remove("is-auto-scrolling");
  };

  useEffect(() => {
    const viewport = sliderViewportRef.current;

    if (!viewport || showcaseSlides.length <= 1) return;

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const interval = window.setInterval(() => {
      const bounds = viewport.getBoundingClientRect();
      const sliderIsVisible =
        bounds.bottom > 0 && bounds.top < window.innerHeight;

      if (
        reducedMotionQuery.matches ||
        document.hidden ||
        !sliderIsVisible ||
        Date.now() < autoplayPauseUntilRef.current
      ) {
        return;
      }

      const items = Array.from(
        viewport.querySelectorAll<HTMLElement>(".hero-slide"),
      );
      const currentId =
        currentSlideIdRef.current ?? showcaseSlides[0]?.id ?? null;
      const currentIndex = showcaseSlides.findIndex(
        (slide) => slide.id === currentId,
      );
      const nextIndex = (Math.max(currentIndex, 0) + 1) % showcaseSlides.length;
      const nextSlide = showcaseSlides[nextIndex];
      const nextItem = items[nextIndex];

      if (!nextSlide || !nextItem) return;

      if (showcaseScrollFrameRef.current !== null) {
        window.cancelAnimationFrame(showcaseScrollFrameRef.current);
      }

      viewport.classList.add("is-auto-scrolling");

      const viewportBounds = viewport.getBoundingClientRect();
      const itemBounds = nextItem.getBoundingClientRect();
      const startScrollLeft = viewport.scrollLeft;
      const scrollDistance =
        itemBounds.left +
        itemBounds.width / 2 -
        (viewportBounds.left + viewportBounds.width / 2);
      const startedAt = window.performance.now();

      const animateScroll = (timestamp: number) => {
        const progress = Math.min(
          (timestamp - startedAt) / SHOWCASE_SCROLL_DURATION_MS,
          1,
        );
        const easedProgress = 0.5 - Math.cos(Math.PI * progress) / 2;

        viewport.scrollLeft = startScrollLeft + scrollDistance * easedProgress;

        if (progress < 1) {
          showcaseScrollFrameRef.current =
            window.requestAnimationFrame(animateScroll);
        } else {
          viewport.scrollLeft = startScrollLeft + scrollDistance;
          viewport.classList.remove("is-auto-scrolling");
          setActiveShowcaseSlide(nextSlide.id);
          showcaseScrollFrameRef.current = null;
        }
      };

      showcaseScrollFrameRef.current =
        window.requestAnimationFrame(animateScroll);
    }, SHOWCASE_AUTOPLAY_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);

      if (showcaseScrollFrameRef.current !== null) {
        window.cancelAnimationFrame(showcaseScrollFrameRef.current);
        showcaseScrollFrameRef.current = null;
      }

      viewport.classList.remove("is-auto-scrolling");
    };
  }, [showcaseSlides]);

  const handleShowcaseScroll = (event: UIEvent<HTMLDivElement>) => {
    const viewport = event.currentTarget.getBoundingClientRect();
    const viewportCenter = viewport.left + viewport.width / 2;
    const items =
      event.currentTarget.querySelectorAll<HTMLElement>(".hero-slide");

    let nearestId: number | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    items.forEach((item) => {
      const bounds = item.getBoundingClientRect();
      const distance = Math.abs(
        bounds.left + bounds.width / 2 - viewportCenter,
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestId = Number(item.dataset.slideId);
      }
    });

    if (nearestId !== null) setActiveShowcaseSlide(nearestId);
  };

  const scrollToCars = (
    event: MouseEvent<HTMLAnchorElement>,
    slideId: number,
  ) => {
    event.preventDefault();
    setActiveShowcaseSlide(slideId);
    document
      .getElementById("cars")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToInventory = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    document
      .getElementById("cars")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <section className="home-hero">
        <picture className="home-hero__media" aria-hidden="true">
          <source media="(max-width: 720px)" srcSet={heroTwo} />
          <img src={heroOne} alt="" />
        </picture>

        <div className="home-hero__overlay" />

        <div className="public-container home-hero__inner">
          <div className="home-hero__copy">
            <span className="site-eyebrow">{t("public.hero.eyebrow")}</span>

            <h1 aria-label={t("public.hero.title")}>
              <span className="home-hero__title-accent">
                {t("public.hero.titleAccent")}
              </span>
              <span>{t("public.hero.titleMiddle")}</span>
              <span>{t("public.hero.titleEnd")}</span>
            </h1>

            <p>{t("public.hero.description")}</p>

            <a
              className="home-hero__cta"
              href="#cars"
              onClick={scrollToInventory}
            >
              <span>{t("public.hero.cta")}</span>
              <SiteIcon name="arrow" />
            </a>
          </div>
        </div>

        <div
          className="hero-slider has-active"
          ref={sliderViewportRef}
          aria-label={t("public.hero.slidesLabel")}
          onScroll={handleShowcaseScroll}
          onPointerDown={pauseShowcaseAutoplay}
          onWheel={pauseShowcaseAutoplay}
          onFocusCapture={pauseShowcaseAutoplay}
        >
          <div className="hero-slider__track">
            {showcaseSlides.map((slide, index) => {
              const primaryTitle = slide.title_en;
              const secondaryTitle = slide.title_ar;
              const primaryLanguage = "en";
              const secondaryLanguage = "ar";
              const isActive = activeSlideId === slide.id;

              return (
                <a
                  className={`hero-slide${
                    isActive ? " is-active" : " is-muted"
                  }`}
                  href="#cars"
                  key={slide.id}
                  data-slide-id={slide.id}
                  aria-label={[primaryTitle, secondaryTitle]
                    .filter(Boolean)
                    .join(" — ")}
                  aria-current={isActive ? "true" : undefined}
                  onFocus={() => setActiveShowcaseSlide(slide.id)}
                  onClick={(event) => scrollToCars(event, slide.id)}
                >
                  <span className="hero-slide__figure" aria-hidden="true">
                    <ShowcaseCarImage
                      src={getAssetUrl(slide.image)}
                      loading="eager"
                    />
                  </span>

                  <span className="hero-slide__dot" aria-hidden="true" />

                  <span className="hero-slide__label">
                    <small className="hero-slide__index">
                      {String(index + 1)}
                    </small>

                    <strong
                      className="hero-slide__title"
                      lang={primaryLanguage}
                      dir="ltr"
                    >
                      {primaryTitle}
                    </strong>

                    {secondaryTitle && (
                      <span
                        className="hero-slide__subtitle"
                        lang={secondaryLanguage}
                        dir="rtl"
                      >
                        {secondaryTitle}
                      </span>
                    )}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home-inventory" id="cars">
        <div className="public-container">
          <div className="section-heading">
            <div>
              <h2>{t("public.cars.title")}</h2>
              <p>{t("public.cars.description")}</p>
            </div>

            <strong>
              {t("public.cars.results", {
                count: formatNumber(visibleCars.length),
              })}
            </strong>
          </div>

          <div className="cars-toolbar">
            <label className="cars-search">
              <SiteIcon name="search" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("public.cars.search")}
                aria-label={t("public.cars.search")}
              />
            </label>

            <div className="cars-toolbar__mobile-actions">
              <button
                className="cars-filter-button"
                type="button"
                onClick={() => setFiltersOpen(true)}
              >
                <SiteIcon name="filter" />
                {t("public.cars.filters")}
              </button>

              <label
                className={`cars-sort-button${
                  filters.sort !== "newest" ? " is-active" : ""
                }`}
              >
                <SiteIcon name="chevron" />
                <span>{t("public.cars.sort")}</span>

                <select
                  value={filters.sort}
                  onChange={(event) =>
                    setFilters({
                      ...filters,
                      sort: event.target.value as Filters["sort"],
                    })
                  }
                  aria-label={t("public.cars.sort")}
                >
                  <option value="newest">{t("public.cars.newest")}</option>
                  <option value="year">{t("public.cars.yearNewest")}</option>
                  <option value="mileage">
                    {t("public.cars.mileageLowest")}
                  </option>
                </select>
              </label>
            </div>

            {hasFilters && (
              <button
                className="cars-clear"
                type="button"
                onClick={clearFilters}
              >
                {t("public.actions.clearFilters")}
              </button>
            )}
          </div>

          <div className="cars-filter-fields cars-filter-fields--desktop">
            <CarFilters
              filters={filters}
              setFilters={setFilters}
              brands={brands}
              fuels={fuels}
            />
          </div>

          {carsQuery.isPending || brandsQuery.isPending ? (
            <CarsState>
              <span className="site-loader" />
              {t("public.cars.loading")}
            </CarsState>
          ) : carsQuery.isError || brandsQuery.isError ? (
            <CarsState>
              <h3>{t("public.cars.errorTitle")}</h3>
              <button
                className="site-button site-button--dark"
                type="button"
                onClick={() => {
                  void carsQuery.refetch();
                  void brandsQuery.refetch();
                }}
              >
                {t("public.actions.retry")}
              </button>
            </CarsState>
          ) : visibleCars.length ? (
            <div className="cars-grid">
              {visibleCars.map((car) => (
                <CarCard car={car} key={car.id} />
              ))}
            </div>
          ) : (
            <CarsState>
              <h3>{t("public.cars.emptyTitle")}</h3>
              <p>{t("public.cars.emptyDescription")}</p>
              <button
                className="site-button site-button--dark"
                type="button"
                onClick={clearFilters}
              >
                {t("public.actions.clearFilters")}
              </button>
            </CarsState>
          )}
        </div>
      </section>

      <FilterSheet open={filtersOpen} onClose={() => setFiltersOpen(false)}>
        <div className="cars-filter-fields">
          <CarFilters
            filters={filters}
            setFilters={setFilters}
            brands={brands}
            fuels={fuels}
            includeSort={false}
          />
        </div>

        {hasFilters && (
          <button
            className="cars-clear cars-clear--sheet"
            type="button"
            onClick={clearFilters}
          >
            {t("public.actions.clearFilters")}
          </button>
        )}
      </FilterSheet>
    </>
  );
}

function ShowcaseCarImage({
  src,
  loading,
}: {
  src: string;
  loading: "eager" | "lazy";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderMode, setRenderMode] = useState<"loading" | "canvas" | "image">(
    "loading",
  );

  const trimTransparentPadding = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    const canvas = canvasRef.current;
    if (!canvas || !image.naturalWidth || !image.naturalHeight) return;

    try {
      const scanCanvas = document.createElement("canvas");
      const scanScale = Math.min(
        1,
        360 / Math.max(image.naturalWidth, image.naturalHeight),
      );
      scanCanvas.width = Math.max(
        1,
        Math.round(image.naturalWidth * scanScale),
      );
      scanCanvas.height = Math.max(
        1,
        Math.round(image.naturalHeight * scanScale),
      );

      const context = scanCanvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Canvas is unavailable");

      context.drawImage(image, 0, 0, scanCanvas.width, scanCanvas.height);
      const pixels = context.getImageData(
        0,
        0,
        scanCanvas.width,
        scanCanvas.height,
      ).data;
      let minX = scanCanvas.width;
      let minY = scanCanvas.height;
      let maxX = -1;
      let maxY = -1;

      for (let y = 0; y < scanCanvas.height; y += 1) {
        for (let x = 0; x < scanCanvas.width; x += 1) {
          if (pixels[(y * scanCanvas.width + x) * 4 + 3] < 16) continue;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }

      if (maxX < minX || maxY < minY) throw new Error("No visible subject");

      const sourceX = Math.max(0, Math.floor(minX / scanScale));
      const sourceY = Math.max(0, Math.floor(minY / scanScale));
      const sourceRight = Math.min(
        image.naturalWidth,
        Math.ceil((maxX + 1) / scanScale),
      );
      const sourceBottom = Math.min(
        image.naturalHeight,
        Math.ceil((maxY + 1) / scanScale),
      );
      canvas.width = sourceRight - sourceX;
      canvas.height = sourceBottom - sourceY;

      const output = canvas.getContext("2d");
      if (!output) throw new Error("Canvas is unavailable");
      output.drawImage(
        image,
        sourceX,
        sourceY,
        canvas.width,
        canvas.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      setRenderMode("canvas");
    } catch {
      setRenderMode("image");
    }
  };

  return (
    <span className={`hero-slide__asset is-${renderMode}`}>
      <img
        src={src}
        alt=""
        crossOrigin="anonymous"
        loading={loading}
        onLoad={trimTransparentPadding}
        onError={() => setRenderMode("image")}
      />
      <canvas ref={canvasRef} />
    </span>
  );
}

function CarFilters({
  filters,
  setFilters,
  brands,
  fuels,
  includeSort = true,
}: {
  filters: Filters;
  setFilters: (value: Filters) => void;
  brands: PublicBrand[];
  fuels: string[];
  includeSort?: boolean;
}) {
  const { t, language } = useI18n();

  const field = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters({ ...filters, [key]: value });

  return (
    <>
      <Filter label={t("public.cars.brand")}>
        <select
          value={filters.brand}
          onChange={(event) => field("brand", event.target.value)}
        >
          <option value="">{t("public.cars.brand")}</option>

          {brands.map((brand) => (
            <option value={brand.id} key={brand.id}>
              {language === "ar" ? brand.name_ar : brand.name_en}
            </option>
          ))}
        </select>
      </Filter>

      <Filter label={t("public.cars.type")}>
        <select
          value={filters.type}
          onChange={(event) =>
            field("type", event.target.value as Filters["type"])
          }
        >
          <option value="">{t("public.cars.type")}</option>
          <option value="normal">{t("public.cars.normal")}</option>
          <option value="hybrid">{t("public.cars.hybrid")}</option>
        </select>
      </Filter>

      <Filter label={t("public.cars.fuel")}>
        <select
          value={filters.fuel}
          onChange={(event) => field("fuel", event.target.value)}
        >
          <option value="">{t("public.cars.fuel")}</option>

          {fuels.map((fuel) => (
            <option value={fuel} key={fuel}>
              {fuel}
            </option>
          ))}
        </select>
      </Filter>

      <Filter label={t("public.cars.transmission")}>
        <select
          value={filters.transmission}
          onChange={(event) =>
            field("transmission", event.target.value as Filters["transmission"])
          }
        >
          <option value="">{t("public.cars.transmission")}</option>
          <option value="automatic">
            {t("public.transmissions.automatic")}
          </option>
          <option value="manual">{t("public.transmissions.manual")}</option>
          <option value="cvt">{t("public.transmissions.cvt")}</option>
        </select>
      </Filter>

      {includeSort && (
        <Filter label={t("public.cars.sort")}>
          <select
            value={filters.sort}
            onChange={(event) =>
              field("sort", event.target.value as Filters["sort"])
            }
          >
            <option value="newest">{t("public.cars.newest")}</option>
            <option value="year">{t("public.cars.yearNewest")}</option>
            <option value="mileage">{t("public.cars.mileageLowest")}</option>
          </select>
        </Filter>
      )}
    </>
  );
}

function Filter({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label>
      <span>{label}</span>
      {children}
    </label>
  );
}

function CarsState({ children }: { children: ReactNode }) {
  return <div className="cars-state">{children}</div>;
}
