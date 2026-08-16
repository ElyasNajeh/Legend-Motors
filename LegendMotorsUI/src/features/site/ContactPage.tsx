import hero from "@/assets/site_assets/slider6.webp"
import { useI18n } from "@/localization/useI18n"
import { SiteIcon } from "./components/SiteIcon"
import { SocialLinks } from "./components/SocialLinks"
import { siteContact } from "./contactInfo"
import { getWhatsAppUrl } from "./whatsapp"

export function ContactPage() {
  const { t } = useI18n()
  const href = getWhatsAppUrl(t("public.contact.whatsappMessage"))

  return (
    <div className="contact-page">
      <div className="contact-page__media">
        <img src={hero} alt="" />
      </div>

      <section className="contact-page__copy">
        <span className="site-eyebrow site-eyebrow--dark">
          {t("public.contact.eyebrow")}
        </span>

        <h1>{t("public.contact.title")}</h1>

        <p>{t("public.contact.lead")}</p>

        <div className="contact-page__details">
          <a href={`mailto:${siteContact.email}`}>
            <SiteIcon name="mail" size={22} />

            <span>
              <small>{t("public.contact.email")}</small>
              <strong dir="ltr">{siteContact.email}</strong>
            </span>
          </a>

          <a href={siteContact.phoneHref}>
            <SiteIcon name="phone" size={22} />

            <span>
              <small>{t("public.contact.phone")}</small>
              <strong dir="ltr">{siteContact.phoneDisplay}</strong>
            </span>
          </a>
        </div>

        <a
          className="public-whatsapp contact-page__button"
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          <SiteIcon name="whatsapp" size={24} />
          {t("public.contact.whatsapp")}
        </a>

        <div className="contact-page__socials">
          <strong>{t("public.contact.follow")}</strong>
          <SocialLinks className="public-socials--contact" />
        </div>
      </section>
    </div>
  )
}
