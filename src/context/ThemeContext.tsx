import { createContext, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from 'react'
import { defaultSitePalette, getOnColor, getSitePalette, isLightPalette, siteColorFields, type SitePalette } from '../lib/siteTheme'

const STORAGE_KEY = 'sonar.site-theme.v1'

type ThemeContextType = {
  palette: SitePalette
  setPalette: (next: SitePalette) => void
  setColor: (key: keyof SitePalette, color: string) => void
  resetPalette: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

function readStoredTheme(): SitePalette {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? getSitePalette(JSON.parse(stored)) : { ...defaultSitePalette }
  } catch {
    return { ...defaultSitePalette }
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [palette, setPalette] = useState<SitePalette>(readStoredTheme)

  useLayoutEffect(() => {
    const root = document.documentElement
    siteColorFields.forEach(({ key }) => root.style.setProperty(`--app-${key.replace(/[A-Z]/g, character => `-${character.toLowerCase()}`)}`, palette[key]))
    root.style.setProperty('--app-on-primary', getOnColor(palette.primary))
    root.style.setProperty('--app-on-secondary', getOnColor(palette.secondary))
    root.style.colorScheme = isLightPalette(palette) ? 'light' : 'dark'
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(palette)) } catch { /* Storage may be unavailable; the theme still works for this session. */ }
  }, [palette])

  useEffect(() => {
    const syncTabs = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return
      try { setPalette(event.newValue ? getSitePalette(JSON.parse(event.newValue)) : { ...defaultSitePalette }) }
      catch { setPalette({ ...defaultSitePalette }) }
    }
    window.addEventListener('storage', syncTabs)
    return () => window.removeEventListener('storage', syncTabs)
  }, [])

  return <ThemeContext.Provider value={{
    palette,
    setPalette: next => setPalette(getSitePalette(next)),
    setColor: (key, color) => setPalette(previous => getSitePalette({ ...previous, [key]: color })),
    resetPalette: () => setPalette({ ...defaultSitePalette }),
  }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside ThemeProvider')
  return context
}
