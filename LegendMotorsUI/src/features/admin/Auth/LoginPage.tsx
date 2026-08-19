import { useState, type FormEvent } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"

import { getLocalizedErrorMessage } from "@/shared/api/error"
import { useAuth } from "./AuthProvider"
import { AuthLoader } from "./AuthLoader"
import logo from "@/assets/dashboard_assets/logo.png"
import { Icon } from "@/shared/components/Icon"
import { RequiredMark } from "@/shared/components/AdminComponents"
import { LanguageSwitcher } from "@/localization/LanguageSwitcher"
import { useI18n } from "@/localization/useI18n"

export function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login, isAuthenticated, isAuthReady } = useAuth()
  const navigate = useNavigate()
  const { direction, language, t } = useI18n()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) return

    setError("")
    setIsSubmitting(true)

    try {
      await login({
        email: email.trim().toLowerCase(),
        password,
      })

      navigate("/admin", { replace: true })
    } catch (caught) {
      setError(getLocalizedErrorMessage(caught, language, t("admin.login.error")))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthReady) {
    return (
      <AuthLoader
        fullPage
        label={t("admin.login.checking")}
      />
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  return (
    <main className="login-screen" dir={direction}>
      <section
        className="login-panel"
        aria-labelledby="login-title"
      >
        <LanguageSwitcher className="login-language" />

        <Link
          className="login-logo"
          to="/admin"
          aria-label="ETA Company dashboard"
        >
          <img
            src={logo}
            alt="ETA Company"
          />
        </Link>

        <div className="login-copy">
          <p>ETA Company</p>

          <h1 id="login-title">
            {t("admin.login.title")}
          </h1>

          <span>
            {t("admin.login.subtitle")}
          </span>
        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          <label
            className="form-field"
            htmlFor="email"
          >
            <span>
              {t("admin.login.email")} <RequiredMark />
            </span>

            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              inputMode="email"
              placeholder="admin@example.com"
              required
              disabled={isSubmitting}
            />
          </label>

          <label
            className="form-field"
            htmlFor="password"
          >
            <span>
              {t("admin.login.password")} <RequiredMark />
            </span>

            <span className="password-field">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                required
                disabled={isSubmitting}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((shown) => !shown)
                }
                aria-label={
                  showPassword
                    ? t("admin.login.hidePassword")
                    : t("admin.login.showPassword")
                }
              >
                <Icon
                  name={
                    showPassword
                      ? "eye"
                      : "eyeOff"
                  }
                />
              </button>
            </span>
          </label>

          {error && (
            <p
              className="login-error"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            className="login-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <AuthLoader
                compact
                label={t("admin.login.signingIn")}
              />
            )}

            {isSubmitting
              ? t("admin.login.signingIn")
              : t("admin.login.signIn")}
          </button>
        </form>

        <p className="login-notice">
          {t("admin.login.notice")}
        </p>
      </section>
    </main>
  )
}
