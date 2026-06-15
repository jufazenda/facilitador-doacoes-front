import { createContext, useContext, useMemo, useState, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import axios from "axios"

const AuthContext = createContext(null)

const ROLE_CLAIM = import.meta.env.VITE_AUTH0_ROLE_CLAIM
const API_BASE   = import.meta.env.VITE_API_URL ?? "http://localhost:8080"

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
    getAccessTokenSilently,
  } = useAuth0()

  const [avatarUrl, setAvatarUrl] = useState(null)

  const user = useMemo(() => {
    if (!isAuthenticated || !auth0User) return null
    const rawRole = ROLE_CLAIM ? auth0User[ROLE_CLAIM] ?? null : null
    const tipo = rawRole ? (ROLE_MAP[rawRole] ?? rawRole) : null
    return {
      nome:      auth0User.name ?? auth0User.email,
      email:     auth0User.email,
      tipo,
      picture:   auth0User.picture ?? null,
      avatarUrl,
    }
  }, [isAuthenticated, auth0User, avatarUrl])

  useEffect(() => {
    if (!isAuthenticated) { setAvatarUrl(null); return }
    const rawRole = ROLE_CLAIM ? auth0User?.[ROLE_CLAIM] ?? null : null
    const tipo = rawRole ? (ROLE_MAP[rawRole] ?? rawRole) : null
    if (tipo !== "doador" && tipo !== "instituicao") return

    getAccessTokenSilently({
      authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
    })
      .then((token) => {
        const url = tipo === "doador"
          ? `${API_BASE}/api/v1/users/me`
          : `${API_BASE}/api/v1/institutions/me`
        return axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
      })
      .then((res) => {
        setAvatarUrl(res.data?.avatar_url ?? res.data?.logo_url ?? null)
      })
      .catch(() => {})
  }, [isAuthenticated, auth0User, getAccessTokenSilently])

  function login() { loginWithRedirect() }
  function logout() { auth0Logout({ logoutParams: { returnTo: window.location.origin } }) }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, setAvatarUrl }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
