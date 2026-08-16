import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import logo from "@/assets/site_assets/logo.webp";
import { LanguageSwitcher } from "@/localization/LanguageSwitcher";
import { useI18n } from "@/localization/useI18n";
import { SocialLinks } from "@/features/site/components/SocialLinks";
import { SiteIcon } from "@/features/site/components/SiteIcon";
import { siteContact } from "@/features/site/contactInfo";
import { getWhatsAppUrl } from "@/features/site/whatsapp";
import "@/features/site/site.css";

export function PublicLayout() {
  const { t, language } = useI18n();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (location.hash) {
        document
          .querySelector(location.hash)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0 });
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "is-active" : "";

  const genericWhatsApp = getWhatsAppUrl(t("public.contact.whatsappMessage"));

  return (
    <div className="public-site">
      <header className={`public-header${menuOpen ? " is-open" : ""}`}>
        <div className="public-container public-header__inner">
          <Link
            className="public-brand"
            to="/"
            aria-label={t("public.brandName")}
          >
            <img src={logo} alt="" />
            <strong>{t("public.brandName")}</strong>
          </Link>

          <nav className="public-nav" aria-label={t("public.nav.home")}>
            <NavLink
              to="/"
              end
              className={navClass}
              onClick={() => setMenuOpen(false)}
            >
              {t("public.nav.home")}
            </NavLink>

            <Link to="/#cars" onClick={() => setMenuOpen(false)}>
              {t("public.nav.cars")}
            </Link>

            <NavLink
              to="/about"
              className={navClass}
              onClick={() => setMenuOpen(false)}
            >
              {t("public.nav.about")}
            </NavLink>

            <NavLink
              to="/contact"
              className={navClass}
              onClick={() => setMenuOpen(false)}
            >
              {t("public.nav.contact")}
            </NavLink>
          </nav>

          <div className="public-header__actions">
            <SocialLinks className="public-socials--header" />

            <LanguageSwitcher className="public-language" />

            <a
              className="public-whatsapp public-whatsapp--compact"
              href={genericWhatsApp}
              target="_blank"
              rel="noreferrer"
              aria-label={t("public.actions.contact")}
            >
              <SiteIcon name="whatsapp" />
              <span>{t("public.actions.contact")}</span>
            </a>

            <button
              className="public-menu-button"
              type="button"
              aria-expanded={menuOpen}
              aria-label={t(menuOpen ? "public.nav.close" : "public.nav.open")}
              onClick={() => setMenuOpen((value) => !value)}
            >
              <SiteIcon name={menuOpen ? "close" : "menu"} size={24} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="public-mobile-menu">
            <nav className="public-container">
              <NavLink
                to="/"
                end
                className={navClass}
                onClick={() => setMenuOpen(false)}
              >
                {t("public.nav.home")}
              </NavLink>

              <Link to="/#cars" onClick={() => setMenuOpen(false)}>
                {t("public.nav.cars")}
              </Link>

              <NavLink
                to="/about"
                className={navClass}
                onClick={() => setMenuOpen(false)}
              >
                {t("public.nav.about")}
              </NavLink>

              <NavLink
                to="/contact"
                className={navClass}
                onClick={() => setMenuOpen(false)}
              >
                {t("public.nav.contact")}
              </NavLink>

              <SocialLinks className="public-socials--menu" />

              <a
                className="public-whatsapp"
                href={genericWhatsApp}
                target="_blank"
                rel="noreferrer"
              >
                <SiteIcon name="whatsapp" />
                {t("public.actions.contact")}
              </a>
            </nav>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="public-container public-footer__grid">
          <div className="public-footer__identity">
            <Link
              className="public-footer__brand"
              to="/"
              aria-label={t("public.brandName")}
            >
              <img src={logo} alt="" />

              <div>
                <strong>{t("public.brandName")}</strong>
                <p>{t("public.footer.tagline")}</p>
              </div>
            </Link>

            <address className="public-footer__contact">
              <span>
                <SiteIcon name="mapPin" size={19} />
                <span>{t("public.footer.address")}</span>
              </span>

              <a href={siteContact.phoneHref}>
                <SiteIcon name="phone" size={19} />
                <span>
                  {t("public.footer.mobile")}{" "}
                  <bdi dir="ltr">{siteContact.phoneDisplay}</bdi>
                </span>
              </a>
            </address>
          </div>

          <nav aria-label={t("public.nav.contact")}>
            <Link to="/#cars">{t("public.nav.cars")}</Link>
            <Link to="/about">{t("public.nav.about")}</Link>
            <Link to="/contact">{t("public.nav.contact")}</Link>
          </nav>

          <div className="public-footer__actions">
            <a
              className="public-whatsapp"
              href={genericWhatsApp}
              target="_blank"
              rel="noreferrer"
            >
              <SiteIcon name="whatsapp" />
              {t("public.actions.contact")}
            </a>

            <SocialLinks className="public-socials--footer" />
          </div>
        </div>

        <div className="public-container public-footer__bottom">
          <span>
            {t("public.footer.rights", {
              year: new Date().getFullYear(),
            })}
          </span>

          <span lang={language === "ar" ? "en" : "ar"}>Legend Motors</span>
        </div>
      </footer>
    </div>
  );
}
