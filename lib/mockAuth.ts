// Mock authentication system for InvestX
export type UserRole = "guest" | "investor" | "admin"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

// Mock user data
const mockUsers: Record<UserRole, User> = {
  guest: {
    id: "guest",
    name: "Guest User",
    email: "guest@example.com",
    role: "guest",
  },
  investor: {
    id: "inv-1",
    name: "Ahmed Khan",
    email: "ahmed@example.com",
    role: "investor",
    avatar: "/professional-pakistani-man.png",
  },
  admin: {
    id: "admin-1",
    name: "Sarah Ali",
    email: "sarah@investx.com",
    role: "admin",
    avatar: "/professional-pakistani-woman.png",
  },
}

// Simple localStorage-based role management
export function setRole(role: UserRole): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("investx-role", role)
  }
}

export function getRole(): UserRole {
  if (typeof window !== "undefined") {
    const role = localStorage.getItem("investx-role") as UserRole
    return role || "guest"
  }
  return "guest"
}

export function getCurrentUser(): User {
  const role = getRole()
  return mockUsers[role]
}

export function isAuthenticated(): boolean {
  return getRole() !== "guest"
}

export function hasRole(requiredRole: UserRole): boolean {
  const currentRole = getRole()

  // Role hierarchy: admin > investor > guest
  const roleHierarchy: Record<UserRole, number> = {
    guest: 0,
    investor: 1,
    admin: 2,
  }

  return roleHierarchy[currentRole] >= roleHierarchy[requiredRole]
}
