import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { RouterProvider } from "react-router-dom"

import { AuthProvider } from "@/features/admin/Auth/AuthProvider"
import { FeedbackProvider } from "@/shared/feedback/FeedbackProvider"
import { queryClient, queryPersistOptions } from "@/shared/query/queryClient"
import { RequestProvider } from "@/shared/request/RequestProvider"
import { I18nProvider } from "@/localization/I18nProvider"
import { router } from "./router"

function App() {
  return (
    <I18nProvider>
      <PersistQueryClientProvider client={queryClient} persistOptions={queryPersistOptions}>
        <FeedbackProvider>
          <RequestProvider>
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </RequestProvider>
        </FeedbackProvider>
      </PersistQueryClientProvider>
    </I18nProvider>
  )
}

export default App
