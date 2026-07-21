import React, { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, registerUser, getCurrentUser } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('weathex_token'))
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setAuthLoading(false)
        return
      }
      try {
        const data = await getCurrentUser()
        setUser(data)
      } catch (err) {
        localStorage.removeItem('weathex_token')
        setToken(null)
        setUser(null)
      } finally {
        setAuthLoading(false)
      }
    }
    loadUser()
  }, [token])

  const login = async (email, password) => {
    setAuthError(null)
    try {
      const data = await loginUser(email, password)
      localStorage.setItem('weathex_token', data.access_token)
      setToken(data.access_token)
      setUser(data.user)
      return true
    } catch (err) {
      setAuthError(err.response?.data?.detail || 'Login failed')
      return false
    }
  }

  const register = async (email, password, fullName) => {
    setAuthError(null)
    try {
      const data = await registerUser(email, password, fullName)
      localStorage.setItem('weathex_token', data.access_token)
      setToken(data.access_token)
      setUser(data.user)
      return true
    } catch (err) {
      setAuthError(err.response?.data?.detail || 'Registration failed')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('weathex_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, authLoading, authError, login, register, logout, setAuthError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)