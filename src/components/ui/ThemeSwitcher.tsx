'use client'

import React, { useEffect } from 'react'
import { Button } from './button'

/**
 * Eine vereinfachte Komponente zum Umschalten des HeiBa-Layouts.
 * Nutzt CSS-Klassen statt Komponenten-Wechsel für bessere Stabilität.
 */
export default function ThemeSwitcher() {
  // Beim Komponentenaufruf den aktuellen Theme-Status bestimmen
  const [isModernTheme, setIsModernTheme] = React.useState(false)
  
  // Beim ersten Rendern den Theme-Status aus localStorage laden
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Prüfen, ob ein bestimmtes Theme gespeichert wurde
        const savedTheme = localStorage.getItem('heiba-theme-modern')
        if (savedTheme === 'true') {
          setIsModernTheme(true)
          document.documentElement.classList.add('theme-modern')
        }
      } catch (error) {
        console.error('Fehler beim Laden des Themes:', error)
      }
    }
  }, [])

  // Theme umschalten
  const toggleTheme = () => {
    try {
      // Neuen Status festlegen
      const newThemeState = !isModernTheme
      
      // Status in React aktualisieren
      setIsModernTheme(newThemeState)
      
      // Ändere das Theme durch Hinzufügen/Entfernen einer CSS-Klasse
      if (newThemeState) {
        document.documentElement.classList.add('theme-modern')
        localStorage.setItem('heiba-theme-modern', 'true')
      } else {
        document.documentElement.classList.remove('theme-modern')
        localStorage.setItem('heiba-theme-modern', 'false')
      }
      
      // Seite neu laden, um alle Theme-Änderungen zu übernehmen
      window.location.reload()
    } catch (error) {
      console.error('Fehler beim Umschalten des Themes:', error)
    }
  }

  return (
    <Button 
      onClick={toggleTheme}
      variant={isModernTheme ? "default" : "outline"}
      className="flex items-center px-3 py-2 text-sm"
    >
      <i className={`fas ${isModernTheme ? 'fa-undo' : 'fa-paint-brush'} mr-2`}></i>
      {isModernTheme ? 'Zum Original-Layout wechseln' : 'Zum modernen Layout wechseln'}
    </Button>
  )
}
