"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { AppShell } from "./app-shell"
import { AppHeader } from "./app-header"
import { RouteGuard } from "./route-guard"

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Routes that should use header only (no sidebar)
  const headerOnlyRoutes = [
    "/", // Landing page
  ]
  
  // Routes that should have no layout at all
  const noLayoutRoutes = [
    "/auth/login",
    "/auth/signup",
  ]
  
  // Routes that require authentication
  const protectedRoutes = [
    "/projects",
    "/dashboard", 
    "/portfolio",
    "/cart",
    "/checkout",
    "/notifications",
    "/wishlist",
    "/compare",
    "/recommendations",
    "/admin",
  ]
  
  // Routes that require specific roles
  const adminOnlyRoutes = ["/admin"]
  const investorRoutes = ["/dashboard", "/portfolio", "/cart", "/checkout"]
  
  // Check if current path needs protection
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminOnlyRoutes.some(route => pathname.startsWith(route))
  const isInvestorRoute = investorRoutes.some(route => pathname.startsWith(route))
  
  // Check if current path should use different layouts
  const shouldUseHeaderOnly = headerOnlyRoutes.includes(pathname)
  const shouldUseNoLayout = noLayoutRoutes.includes(pathname)
  
  if (shouldUseNoLayout) {
    // For auth pages, render without any layout or protection
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-6">{children}</main>
      </div>
    )
  }
  
  if (shouldUseHeaderOnly) {
    // For landing page, render with header only (no protection needed)
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="overflow-y-auto">{children}</main>
      </div>
    )
  }
  
  // For protected routes, wrap with RouteGuard and full AppShell
  if (isProtectedRoute) {
    let allowedRoles: string[] = []
    
    if (isAdminRoute) {
      allowedRoles = ["admin"]
    } else if (isInvestorRoute) {
      allowedRoles = ["investor", "admin"]
    } else {
      allowedRoles = ["guest", "investor", "admin"] // Most routes allow all authenticated users
    }
    
    return (
      <RouteGuard requireAuth={true} allowedRoles={allowedRoles}>
        <AppShell>{children}</AppShell>
      </RouteGuard>
    )
  }
  
  // For all other pages, use full AppShell without protection
  return <AppShell>{children}</AppShell>
}
