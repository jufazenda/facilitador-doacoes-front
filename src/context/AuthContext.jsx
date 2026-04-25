import { createContext, useContext, useState } from "react"

const AuthContext = createContext(null)

const STORAGE_KEY = "elo_user"

function carregaUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(carregaUser)

  function login(dadosUser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dadosUser))
    setUser(dadosUser)
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
