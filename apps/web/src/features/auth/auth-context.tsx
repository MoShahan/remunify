import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  clearAuthStorage,
  getStoredToken,
  getStoredUser,
  loginRequest,
  persistAuth,
  setUnauthorizedHandler,
  type AuthUser,
} from '@/lib/api'

type AuthContextValue = {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser())

  const logout = () => {
    clearAuthStorage()
    setToken(null)
    setUser(null)
  }

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout()
      navigate('/login', { replace: true })
    })
    return () => setUnauthorizedHandler(null)
  }, [navigate])

  const login = async (email: string, password: string) => {
    const response = await loginRequest(email, password)
    persistAuth(response.data.token, response.data.user)
    setToken(response.data.token)
    setUser(response.data.user)
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook colocated with provider (standard React context pattern).
// eslint-disable-next-line react-refresh/only-export-components -- useAuth pairs with AuthProvider
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
