import { siteSocialLinks } from "../shared/contactInfo"
import { SiteIcon } from "./SiteIcon"

export function SocialLinks({ className }: { className: string }) {
  return (
    <div className={`public-socials ${className}`}>
      {siteSocialLinks.map((social) => (
        <a
          key={social.name}
          className="public-social-link"
          href={social.href}
          target="_blank"
          rel="noreferrer"
          aria-label={social.name}
        >
          <SiteIcon name={social.icon} size={19} />
        </a>
      ))}
    </div>
  )
}
