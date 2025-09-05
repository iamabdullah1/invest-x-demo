"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import {
  Home,
  Building2,
  ShoppingCart,
  CreditCard,
  Briefcase,
  Bell,
  Settings,
  Users,
  BarChart3,
  Plus,
  LogIn,
  UserPlus,
  Heart,
  Sparkles,
  GitCompare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { type UserRole, getRole } from "@/lib/mockAuth"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    roles: ["investor", "admin"],
  },
  {
    title: "Projects",
    href: "/projects",
    icon: Building2,
    roles: ["guest", "investor", ],
  },
  {
    title: "Recommendations",
    href: "/recommendations",
    icon: Sparkles,
    roles: ["investor"],
  },
  {
    title: "Compare",
    href: "/compare",
    icon: GitCompare,
    roles: ["investor"],
  },
  {
    title: "Wishlist",
    href: "/wishlist",
    icon: Heart,
    roles: ["investor"],
  },
  {
    title: "Cart",
    href: "/cart",
    icon: ShoppingCart,
    roles: ["investor"],
  },
  {
    title: "Checkout",
    href: "/checkout",
    icon: CreditCard,
    roles: ["investor"],
  },
  {
    title: "Portfolio",
    href: "/portfolio",
    icon: Briefcase,
    roles: ["investor"],
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
    roles: ["investor"],
  },
]

const authItems: NavItem[] = [
  {
    title: "Login",
    href: "/auth/login",
    icon: LogIn,
    roles: ["guest"], // Only for unauthenticated users
  },
  {
    title: "Sign Up",
    href: "/auth/signup",
    icon: UserPlus,
    roles: ["guest"], // Only for unauthenticated users
  },
]

const adminItems: NavItem[] = [
  {
    title: "Admin Home",
    href: "/admin",
    icon: Settings,
    roles: ["admin"],
  },
  {
    title: "Manage Projects",
    href: "/admin/projects",
    icon: Building2,
    roles: ["admin"],
  },
  {
    title: "Add Project",
    href: "/admin/projects/new",
    icon: Plus,
    roles: ["admin"],
  },
  {
    title: "Investors",
    href: "/admin/investors",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    roles: ["admin"],
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["admin"],
  },
]

export function AppSidebar() {
  const { user, isAuthenticated } = useAuth()
  const pathname = usePathname()
  const currentRole = user?.role || "guest"

  const isInAdminSection = pathname.startsWith("/admin")

  const filterItemsByRole = (items: NavItem[]) => {
    return items.filter((item) => item.roles.includes(currentRole))
  }

  const getNavigationItems = () => {
    if (currentRole === "guest") {
      return filterItemsByRole(navItems)
    }

    if (currentRole === "admin" && isInAdminSection) {
      return [] // No regular navigation items in admin section
    }

    if (currentRole === "admin" && !isInAdminSection) {
      return filterItemsByRole(navItems)
    }

    return filterItemsByRole(navItems)
  }

  const shouldShowAdminItems = () => {
    return currentRole === "admin"
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <Link href="/" className="flex items-center space-x-2">
          <Building2 className="h-8 w-8 text-sidebar-primary" />
          <span className="text-xl font-bold text-sidebar-foreground">InvestX</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {/* Main Navigation */}
        {getNavigationItems().length > 0 && (
          <div className="space-y-1">
            {getNavigationItems().map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </div>
        )}

        {/* Auth Items (only for unauthenticated users) */}
        {!isAuthenticated && (
          <div className="pt-4 border-t border-sidebar-border">
            <div className="space-y-1">
              {authItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Admin Items */}
        {shouldShowAdminItems() && (
          <div className={cn("border-t border-sidebar-border", !isInAdminSection && "pt-4")}>
            {!isInAdminSection && (
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">Admin</h3>
              </div>
            )}
            <div className="space-y-1">
              {filterItemsByRole(adminItems).map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>
    </div>
  )
}
