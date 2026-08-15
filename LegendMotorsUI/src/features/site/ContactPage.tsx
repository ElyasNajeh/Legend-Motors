import hero from "@/assets/site_assets/slider6.webp"
import { useI18n } from "@/localization/useI18n"
import { SiteIcon } from "./components/SiteIcon"
import { getWhatsAppUrl } from "./whatsapp"

export function ContactPage() {
  const { t } = useI18n()
  const href = getWhatsAppUrl(t("public.contact.whatsappMessage"))
  return <div className="contact-page">
    <div className="contact-page__media"><img src={hero} alt="" /></div>
    <section className="contact-page__copy"><span className="site-eyebrow site-eyebrow--dark">{t("public.contact.eyebrow")}</span><h1>{t("public.contact.title")}</h1><p>{t("public.contact.lead")}</p><a className="public-whatsapp contact-page__button" href={href} target="_blank" rel="noreferrer"><SiteIcon name="whatsapp" size={24} />{t("public.contact.whatsapp")}</a></section>
  </div>
}
