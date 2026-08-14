import { useState } from "react"
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/features/admin/Auth/AuthProvider"
import { Icon, type IconName } from "@/shared/components/Icon"
import logo from "@/assets/dashboard_assets/logo.png"
import { LanguageSwitcher } from "@/localization/LanguageSwitcher"
import { useI18n } from "@/localization/useI18n"

const links: Array<{ to: string; labelKey: string; icon: IconName; end?: boolean }> = [
  { to: "/admin", labelKey: "admin.dashboard", icon: "dashboard", end: true },
  { to: "/admin/cars", labelKey: "admin.cars", icon: "cars" },
  { to: "/admin/brands", labelKey: "admin.brands", icon: "brands" },
  { to: "/admin/sliders", labelKey: "admin.sliders", icon: "sliders" },
  { to: "/admin/admins", labelKey: "admin.admins", icon: "admins" },
  { to: "/admin/settings", labelKey: "admin.settings", icon: "settings" },
]

export function AdminLayout() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const { direction, t } = useI18n()
  const displayName = user?.email.split("@")[0] ?? "admin"
  const activeLink = links.find((link) => link.end ? location.pathname === link.to : location.pathname.startsWith(link.to))

  async function signOut() {
    await logout()
    navigate("/admin/login", { replace: true })
  }

  return (
    <div className="admin-shell" dir={direction}>
      <aside className={open ? "open" : ""}>
        <Link className="sidebar-brand" to="/admin" onClick={() => setOpen(false)} aria-label="ETA Company dashboard">
          <span className="sidebar-logo"><img src={logo} alt="" /></span>
          <div><strong>ETA Company</strong><small>{t("admin.panel")}</small></div>
        </Link>
        <nav>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setOpen(false)}>
              <Icon name={link.icon} />{t(link.labelKey)}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <strong>{displayName}</strong>
          <button className="sidebar-signout" title={t("admin.signOut")} onClick={() => void signOut()}>
            <Icon name="logout" /><span>{t("admin.logout")}</span>
          </button>
        </div>
      </aside>
      {open && <button className="drawer-backdrop" aria-label={t("admin.closeNavigation")} onClick={() => setOpen(false)} />}
      <div className="admin-workspace">
        <header className="admin-topbar">
          <button className="menu-button" aria-label={t("admin.openNavigation")} onClick={() => setOpen(true)}><Icon name="menu" /></button>
          <span>{activeLink ? t(activeLink.labelKey) : t("admin.panel")}</span>
          <div><LanguageSwitcher /></div>
        </header>
        <main><Outlet /></main>
      </div>
    </div>
  )
}
