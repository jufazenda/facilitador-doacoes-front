import { useMemo } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { AuthContext } from "./auth-context"

const ROLE_CLAIM = import.meta.env.VITE_AUTH0_ROLE_CLAIM

const ROLE_MAP = {
  donor:       "doador",
  institution: "instituicao",
  admin:       "admin",
}

export function AuthProvider({ children }) {
  const {
    isAuthenticated,
    user: auth0User,
    loginWithRedirect,
    logout: auth0Logout,
    isLoading,
  } = useAuth0()

  const user = useMemo(() => {
    if (!isAuthenticated || !auth0User) return null
    const rawRole = ROLE_CLAIM ? auth0User[ROLE_CLAIM] ?? null : null
    return {
      name:  auth0User.name ?? auth0User.email,
      email: auth0User.email,
      type:  rawRole ? (ROLE_MAP[rawRole] ?? rawRole) : null,
    }
  }, [isAuthenticated, auth0User])

  function login() {
    loginWithRedirect()
  }

  function logout() {
    auth0Logout({ logoutParams: { returnTo: window.location.origin } })
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
