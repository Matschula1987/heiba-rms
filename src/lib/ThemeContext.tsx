'use client'

import React, { createContext, useState, useContext, useEffect } from 'react'

// Definiere die möglichen Themes
export type ThemeType = 'original' | 'alternative'

// Interface für den Theme-Kontext
interface ThemeContextType {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
  toggleTheme: () => void
}

// Erstelle den Kontext mit Standardwerten
const ThemeContext = createContext<ThemeContextType>({
  theme: 'original',
  setTheme: () => {},
  toggleTheme: () => {}
})

// Hook für einfachen Zugriff auf den Theme-Kontext
export const useTheme = () => useContext(ThemeContext)

// Theme Provider Komponente
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // State für das aktuelle Theme
  const [theme, setTheme] = useState<ThemeType>('original')
  
  // Beim ersten Rendern das gespeicherte Theme aus dem localStorage laden
  useEffect(() => {
    // Nur client-seitig ausführen
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('heiba-theme') as ThemeType
      if (savedTheme && (savedTheme === 'original' || savedTheme === 'alternative')) {
        setTheme(savedTheme)
      }
    }
  }, [])
  
  // Funktion zum Wechseln des Themes
  const toggleTheme = () => {
    const newTheme = theme === 'original' ? 'alternative' : 'original'
    setTheme(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('heiba-theme', newTheme)
    }
  }
  
  // Funktion zum direkten Setzen des Themes
  const changeTheme = (newTheme: ThemeType) => {
    setTheme(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('heiba-theme', newTheme)
    }
  }
  
  // Kontext-Wert
  const contextValue = {
    theme,
    setTheme: changeTheme,
    toggleTheme
  }
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}
