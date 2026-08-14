import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react"

import type { LoginRequest, User } from "./auth.types"

import {
  login as loginRequest,
  logout as logoutRequest,
  getMe,
  refresh,
} from "./auth.api"

import {
  clearAccessToken,
  setAccessToken,
} from "./token-store"
import { useRequest } from "@/shared/request/RequestProvider"

type AuthContextType = {
  user: User | null
  isAuthReady: boolean
  isAuthenticated: boolean
  login: (request: LoginRequest) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { runRequest } = useRequest()

  useEffect(() => {
    async function restoreSession() {
      try {
        const refreshResponse = await runRequest(refresh, { silentStatuses: [401] })

        setAccessToken(refreshResponse.access_token)

        const currentUser = await runRequest(getMe, { silentStatuses: [401] })

        setUser(currentUser)
      } catch {
        clearAccessToken()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [runRequest])

  useEffect(() => {
    const expireSession = () => {
      clearAccessToken()
      setUser(null)
    }
    window.addEventListener("eta-auth-expired", expireSession)
    return () => window.removeEventListener("eta-auth-expired", expireSession)
  }, [])

  async function login(request: LoginRequest) {
    const response = await runRequest(() => loginRequest(request), { silentStatuses: [401] })

    setAccessToken(response.access_token)

    const currentUser = await runRequest(getMe)

    setUser(currentUser)
  }

  async function logout() {
    try {
      await runRequest(logoutRequest)
    } finally {
      clearAccessToken()
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthReady: !loading,
        isAuthenticated: user !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }

  return context
}
