import { useState, useCallback } from "react"

export function useImagePosition(storageKey) {
  const [position, setPosition] = useState(() => {
    try {
      return localStorage.getItem(storageKey) ?? "50% 50%"
    } catch {
      return "50% 50%"
    }
  })

  const save = useCallback(
    (pos) => {
      setPosition(pos)
      try { localStorage.setItem(storageKey, pos) } catch {}
    },
    [storageKey]
  )

  return { position, save }
}

// backward-compat alias used by InstitutionDetail
export function useCoverPosition(instId) {
  return useImagePosition(`cover_pos_${instId}`)
}
