import { useEffect, useRef, useState } from "react";
import aboutOne from "@/assets/site_assets/about_us_1.jpg";
import aboutTwo from "@/assets/site_assets/about_us_2.jpg";
import aboutThree from "@/assets/site_assets/about_us_3.jpg";
import aboutHero from "@/assets/site_assets/about_us_hero.png";
import brandIcon from "@/assets/site_assets/brand_icon.png";
import carIcon from "@/assets/site_assets/car_icon.png";
import happyCustomerIcon from "@/assets/site_assets/happy_customer_icon.png";
import { useI18n } from "@/localization/useI18n";
import { SiteIcon } from "../components/SiteIcon";
import { siteContact } from "../shared/contactInfo";

const gallery = [
  { src: aboutOne, altKey: "public.about.galleryOneAlt" },
  { src: aboutTwo, altKey: "public.about.galleryTwoAlt" },
  { src: aboutThree, altKey: "public.about.galleryThreeAlt" },
] as const;

const statistics = [
  { value: 15, labelKey: "public.about.brands", icon: brandIcon },
  { value: 100, labelKey: "public.about.cars", icon: carIcon },
  {
    value: 1000,
    labelKey: "public.about.happyCustomers",
    icon: happyCustomerIcon,
  },
] as const;

export function AboutPage() {
  const { t, formatNumber } = useI18n();

  return (
    <div className="about-page">
      <header className="about-title">
        <div className="public-container about-title__inner">
          <h1>{t("public.about.title")}</h1>
        </div>
      </header>

      <section className="about-intro">
        <div className="public-container">
          <span aria-hidden="true" />
          <h2>{t("public.about.introductionTitle")}</h2>
          <p>{t("public.about.introduction")}</p>
        </div>
      </section>

      <section
        className="public-container about-gallery"
        aria-label={t("public.about.galleryLabel")}
      >
        {gallery.map((image, index) => (
          <figure
            className={`about-gallery__item about-gallery__item--${index + 1}`}
            key={image.src}
          >
            <img
              src={image.src}
              alt={t(image.altKey)}
              width={index === 0 ? 1536 : index === 1 ? 1752 : 1284}
              height={index === 0 ? 2048 : index === 1 ? 2048 : 1507}
              loading="lazy"
              decoding="async"
            />
          </figure>
        ))}
      </section>

      <section className="about-contact">
        <img
          className="about-contact__background"
          src={aboutHero}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <div className="about-contact__shade" />

        <div className="public-container about-contact__grid">
          <div className="about-contact__details">
            <span className="site-eyebrow">
              {t("public.about.visitEyebrow")}
            </span>
            <h2>{t("public.about.visitTitle")}</h2>

            <address>
              <a
                className="about-contact__location"
                href={siteContact.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
              >
                <SiteIcon name="mapPin" size={24} />
                <span>
                  <small>{t("public.about.location")}</small>
                  <strong>{t("public.about.locationValue")}</strong>
                </span>
              </a>

              <a href={siteContact.phoneHref}>
                <SiteIcon name="phone" size={24} />
                <span>
                  <small>{t("public.about.phone")}</small>
                  <strong>
                    <bdi dir="ltr">{siteContact.phoneDisplay}</bdi>
                  </strong>
                </span>
              </a>

              <a href={`mailto:${siteContact.email}`}>
                <SiteIcon name="mail" size={24} />
                <span>
                  <small>{t("public.about.email")}</small>
                  <strong>
                    <bdi dir="ltr">{siteContact.email}</bdi>
                  </strong>
                </span>
              </a>
            </address>
          </div>

          <div className="about-map">
            <iframe
              src={siteContact.googleMapsEmbedUrl}
              title={t("public.about.mapTitle")}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              tabIndex={-1}
              aria-hidden="true"
            />
            <a
              href={siteContact.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={t("public.about.openMapLabel")}
            >
              <span>
                {t("public.about.openMap")}
                <SiteIcon name="arrow" size={18} />
              </span>
            </a>
          </div>
        </div>
      </section>

      <section
        className="about-stats"
        aria-label={t("public.about.statisticsLabel")}
      >
        <div className="public-container about-stats__grid">
          {statistics.map((statistic) => (
            <AnimatedStatistic
              key={statistic.labelKey}
              value={statistic.value}
              label={t(statistic.labelKey)}
              icon={statistic.icon}
              formatNumber={formatNumber}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function AnimatedStatistic({
  value,
  label,
  icon,
  formatNumber,
}: {
  value: number;
  label: string;
  icon: string;
  formatNumber: (value: number) => string;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const hasAnimatedRef = useRef(false);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const element = rootRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (
      !element ||
      reducedMotion.matches ||
      !("IntersectionObserver" in window)
    ) {
      hasAnimatedRef.current = true;
      setDisplayValue(value);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimatedRef.current) return;

        hasAnimatedRef.current = true;
        observer.disconnect();
        const startedAt = performance.now();

        const animate = (currentTime: number) => {
          const progress = Math.min((currentTime - startedAt) / 1400, 1);
          const easedProgress = 1 - Math.pow(1 - progress, 3);

          setDisplayValue(Math.min(value, Math.round(value * easedProgress)));

          if (progress < 1) {
            animationFrameRef.current = window.requestAnimationFrame(animate);
          }
        };

        animationFrameRef.current = window.requestAnimationFrame(animate);
      },
      { threshold: 0.3 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value]);

  return (
    <article className="about-stat" ref={rootRef}>
      <span className="site-sr-only">
        {formatNumber(value)}+ {label}
      </span>

      <div aria-hidden="true">
        <span className="about-stat__icon">
          <img src={icon} alt="" />
        </span>
        <strong>
          <bdi dir="ltr">{formatNumber(displayValue)}+</bdi>
        </strong>
        <span>{label}</span>
      </div>
    </article>
  );
}
