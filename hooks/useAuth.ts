"use client"

import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  role: string
  name: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        // Check for stored authentication data
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
        } else {
          // For demo purposes, create a default admin user
          // In production, this should redirect to login
          const defaultUser: User = {
            id: '1',
            email: 'admin@example.com',
            role: 'admin',
            name: 'Admin User'
          }
          setUser(defaultUser)
          localStorage.setItem('user', JSON.stringify(defaultUser))
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const hasRole = (role: string): boolean => {
    return user?.role === role
  }

  const isAuthenticated = (): boolean => {
    return user !== null
  }

  const logout = async () => {
    try {
      // Clear stored authentication data
      localStorage.removeItem('user')
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // In a real app, this would make an API call
      // For demo purposes, accept any email/password combination
      if (email && password) {
        const userData: User = {
          id: '1',
          email: email,
          role: email.includes('admin') ? 'admin' : 'investor',
          name: email.split('@')[0]
        }
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  return {
    user,
    loading,
    hasRole,
    isAuthenticated,
    logout,
    login
  }
}
