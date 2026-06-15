import { useState, useCallback, useEffect } from "react"
import { useAuth } from "../context/AuthContext"

function storageKey(userEmail) {
  return `favorites_${userEmail}`
}

export function useFavorites() {
  const { user } = useAuth()
  const key = user?.email ? storageKey(user.email) : null

  const [favorites, setFavorites] = useState(() => {
    if (!key) return []
    try {
      return JSON.parse(localStorage.getItem(key)) ?? []
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (!key) { setFavorites([]); return }
    try {
      setFavorites(JSON.parse(localStorage.getItem(key)) ?? [])
    } catch {
      setFavorites([])
    }
  }, [key])

  const toggle = useCallback(
    (inst) => {
      if (!key) return
      setFavorites((prev) => {
        const exists = prev.some((f) => f.id === inst.id)
        const next = exists
          ? prev.filter((f) => f.id !== inst.id)
          : [...prev, { id: inst.id, name: inst.name, logo_url: inst.logo_url ?? null }]
        localStorage.setItem(key, JSON.stringify(next))
        return next
      })
    },
    [key]
  )

  const isFavorite = useCallback(
    (id) => favorites.some((f) => f.id === id),
    [favorites]
  )

  return { favorites, toggle, isFavorite }
}
