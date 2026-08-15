import { RouterProvider } from "react-router-dom"

import { AuthProvider } from "@/features/admin/Auth/AuthProvider"
import { FeedbackProvider } from "@/shared/feedback/FeedbackProvider"
import { RequestProvider } from "@/shared/request/RequestProvider"
import { I18nProvider } from "@/localization/I18nProvider"
import { router } from "./router"

function App() {
  return (
    <I18nProvider>
      <FeedbackProvider>
        <RequestProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </RequestProvider>
      </FeedbackProvider>
    </I18nProvider>
  )
}

export default App
