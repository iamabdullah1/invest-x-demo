"use client"

import { useState, useEffect } from "react"
import { Bell, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { type UserRole, getCurrentUser, setRole, getRole } from "@/lib/mockAuth"

export function AppHeader() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser())
  const [currentRole, setCurrentRole] = useState<UserRole>("guest")
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const role = getRole()
    setCurrentRole(role)
    setCurrentUser(getCurrentUser())
  }, [])

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole)
    setCurrentRole(newRole)
    setCurrentUser(getCurrentUser())
    // Refresh the page to update navigation
    window.location.reload()
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold text-foreground">Real Estate Investment Platform</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        {currentRole !== "guest" && (
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
              3
            </Badge>
            <span className="sr-only">Notifications</span>
          </Button>
        )}

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                <Badge variant="secondary" className="w-fit text-xs">
                  {currentRole}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Demo Role Switcher */}
            <DropdownMenuLabel className="text-xs text-muted-foreground">Demo: Switch Role</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleRoleChange("guest")}>Guest User</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange("investor")}>Investor</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange("admin")}>Admin</DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
