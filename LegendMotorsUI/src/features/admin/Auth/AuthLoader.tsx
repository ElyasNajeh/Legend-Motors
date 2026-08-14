type AuthLoaderProps = { fullPage?: boolean; compact?: boolean; label?: string }

export function AuthLoader({ fullPage = false, compact = false, label = "Loading" }: AuthLoaderProps) {
  const loader = (
    <span className={`auth-loader${compact ? " auth-loader--compact" : ""}`} role="status" aria-label={label}>
      {compact ? <span className="eta-loader-mini" aria-hidden="true" /> : (
        <svg className="eta-loader-svg" viewBox="0 0 140 140" aria-hidden="true">
          <defs>
            <radialGradient id="etaLoaderCore" cx="0" cy="0" r="1" gradientTransform="matrix(42 0 0 42 70 70)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="1" stopColor="#eef3f8" />
            </radialGradient>
            <filter id="etaLoaderShadow" x="-45%" y="-45%" width="190%" height="190%" colorInterpolationFilters="sRGB">
              <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#101827" floodOpacity="0.22" />
            </filter>
          </defs>
          <circle className="eta-loader-glow" cx="70" cy="70" r="56" />
          <circle className="eta-loader-track" cx="70" cy="70" r="48" />
          <g className="eta-loader-spin">
            <path className="eta-loader-arc eta-loader-arc--navy" d="M27 72a43 43 0 0 1 75-31" />
            <path className="eta-loader-arc eta-loader-arc--gold" d="M111 65a43 43 0 0 1-43 48" />
          </g>
          <g filter="url(#etaLoaderShadow)">
            <circle className="eta-loader-core" cx="70" cy="70" r="34" />
            <text className="eta-loader-word" x="70" y="82" textAnchor="middle">ETA</text>
          </g>
        </svg>
      )}
    </span>
  )
  return fullPage ? <main className="auth-loader-page">{loader}</main> : loader
}
