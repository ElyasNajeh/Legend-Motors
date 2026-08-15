import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/noto-sans-arabic'
import './index.css'
import App from './App/App.tsx'
import { initializeTheme } from './shared/theme.ts'
import { initializeI18n } from './localization/i18n.ts'
import { setupAuthInterceptor } from './features/admin/Auth/auth.interceptor.ts'

initializeTheme()
initializeI18n()
setupAuthInterceptor()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
