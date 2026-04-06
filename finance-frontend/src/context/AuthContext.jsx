import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fin_user')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('fin_token'))

  const login = (token, user) => {
    localStorage.setItem('fin_token', token)
    localStorage.setItem('fin_user', JSON.stringify(user))
    setToken(token)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('fin_token')
    localStorage.removeItem('fin_user')
    setToken(null)
    setUser(null)
  }

  const isLoggedIn = !!token && !!user

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
