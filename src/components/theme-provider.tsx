import { createContext, useContext, useEffect, useState } from "react"

type Theme = "default" | "twitter" | "clude" | "vercel"
type Mode = "light" | "dark"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultMode?: Mode
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  mode: Mode
  setTheme: (theme: Theme) => void
  setMode: (mode: Mode) => void
}

const initialState: ThemeProviderState = {
  theme: "default",
  mode: "light",
  setTheme: () => null,
  setMode: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "default",
  defaultMode = "light",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(`${storageKey}-theme`) as Theme) || defaultTheme
  )
  const [mode, setMode] = useState<Mode>(
    () => (localStorage.getItem(`${storageKey}-mode`) as Mode) || defaultMode
  )

  useEffect(() => {
    const root = window.document.documentElement

    // Remove all existing theme and mode classes
    root.classList.remove("default", "twitter", "clude", "vercel", "light", "dark")

    // Apply the theme class
    root.classList.add(theme)
    
    // Apply the mode class
    root.classList.add(mode)
  }, [theme, mode])

  const value = {
    theme,
    mode,
    setTheme: (theme: Theme) => {
      localStorage.setItem(`${storageKey}-theme`, theme)
      setTheme(theme)
    },
    setMode: (mode: Mode) => {
      localStorage.setItem(`${storageKey}-mode`, mode)
      setMode(mode)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
