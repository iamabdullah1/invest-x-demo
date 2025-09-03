"use client"

import * as React from "react"

export interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "light",
  enableSystem = false,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState(defaultTheme)

  React.useEffect(() => {
    // Simple theme management without next-themes dependency
    const root = document.documentElement
    if (attribute === "class") {
      root.className = theme
    } else {
      root.setAttribute(attribute, theme)
    }
  }, [theme, attribute])

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      themes: ["light", "dark"],
      systemTheme: "light",
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

const ThemeContext = React.createContext<{
  theme: string
  setTheme: (theme: string) => void
  themes: string[]
  systemTheme: string
}>({
  theme: "light",
  setTheme: () => {},
  themes: ["light", "dark"],
  systemTheme: "light",
})

export const useTheme = () => {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
