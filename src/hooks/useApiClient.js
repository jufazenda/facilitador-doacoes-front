import { useMemo } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import axios from "axios"

/**
 * Returns an axios instance that automatically attaches the Auth0 Bearer token
 * to every request. Use this hook inside components that call protected API routes.
 *
 * For public endpoints use the default `api` from `src/services/api.js` instead.
 */
export function useApiClient() {
  const { getAccessTokenSilently } = useAuth0()

  return useMemo(() => {
    const client = axios.create({
      baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
    })

    client.interceptors.request.use(async (config) => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
        })
        console.log("[useApiClient] token:", token?.slice(0, 30))
        config.headers.Authorization = `Bearer ${token}`
      } catch (err) {
        console.error("[useApiClient] getAccessTokenSilently error:", err)
      }
      return config
    })

    return client
  }, [getAccessTokenSilently])
}
