"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

interface RouteGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  allowedRoles?: string[]
  redirectTo?: string
}

export function RouteGuard({ 
  children, 
  requireAuth = true, 
  allowedRoles = [], 
  redirectTo = "/auth/login" 
}: RouteGuardProps) {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return // Don't redirect while loading

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      console.log('🔒 Route Guard: Redirecting unauthenticated user to', redirectTo)
      router.replace(redirectTo)
      return
    }

    // If specific roles are required, check user role
    if (allowedRoles.length > 0 && user) {
      if (!allowedRoles.includes(user.role)) {
        console.log('🔒 Route Guard: User role', user.role, 'not allowed. Required:', allowedRoles)
        // Redirect based on user role
        if (user.role === 'admin') {
          router.replace('/admin')
        } else if (user.role === 'investor') {
          router.replace('/dashboard')
        } else {
          router.replace('/') // Guest users go to landing page
        }
        return
      }
    }
  }, [user, isAuthenticated, loading, requireAuth, allowedRoles, redirectTo, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render children if redirecting
  if (requireAuth && !isAuthenticated) {
    return null
  }

  // Don't render if user doesn't have required role
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}
