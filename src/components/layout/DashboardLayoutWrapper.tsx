'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import ThemeSwitcher from '@/components/ui/ThemeSwitcher'

/**
 * Alternatives moderneres Dashboard-Layout
 * Basiert auf dem HeiBa-Design mit Gold und Blau als Hauptfarben wie im SVG-Design
 */
export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Simuliere einen eingeloggten Benutzer
  useEffect(() => {
    setUser({ name: 'Admin' })
  }, [])

  // Navigation-Items
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'fa-home' },
    { path: '/dashboard/candidates', label: 'Kandidaten', icon: 'fa-user' },
    { path: '/dashboard/customers', label: 'Kunden', icon: 'fa-building' },
    { path: '/dashboard/jobs', label: 'Jobs', icon: 'fa-briefcase' },
    { path: '/dashboard/matching', label: 'Matching', icon: 'fa-link' },
    { path: '/dashboard/portals', label: 'Portale', icon: 'fa-globe' },
    { path: '/dashboard/reports', label: 'Berichte', icon: 'fa-chart-bar' },
    { path: '/dashboard/settings', label: 'Einstellungen', icon: 'fa-cog' },
    { path: '/dashboard/integrations', label: 'Integrationen', icon: 'fa-plug' },
  ]

  // Diese Funktion erzeugt die Sidebar-Links basierend auf dem aktuellen Pfad
  const getSidebarItems = () => {
    if (pathname?.includes('/dashboard/candidates')) {
      return [
        { path: '/dashboard/candidates', label: 'Übersicht', icon: 'fa-list' },
        { path: '/dashboard/candidates/new', label: 'Neuer Kandidat', icon: 'fa-user-plus' },
        { path: '/dashboard/candidates/active', label: 'Aktive Kandidaten', icon: 'fa-users' },
        { path: '/dashboard/candidates/archived', label: 'Archivierte', icon: 'fa-archive' },
      ]
    }
    
    if (pathname?.includes('/dashboard/customers')) {
      return [
        { path: '/dashboard/customers', label: 'Übersicht', icon: 'fa-list' },
        { path: '/dashboard/customers/new?type=customer', label: 'Neuer Kunde', icon: 'fa-building' },
        { path: '/dashboard/customers/new?type=prospect', label: 'Neuer Interessent', icon: 'fa-user-tie' },
        { path: '/dashboard/customers/active', label: 'Aktive Kunden', icon: 'fa-briefcase' },
        { path: '/dashboard/customers/prospects', label: 'Interessenten', icon: 'fa-handshake' },
      ]
    }
    
    if (pathname?.includes('/dashboard/jobs')) {
      return [
        { path: '/dashboard/jobs', label: 'Übersicht', icon: 'fa-list' },
        { path: '/dashboard/jobs/new', label: 'Neue Stelle', icon: 'fa-plus-circle' },
      ]
    }
    
    if (pathname?.includes('/dashboard/integrations')) {
      return [
        { path: '/dashboard/integrations', label: 'Übersicht', icon: 'fa-list' },
        { path: '/dashboard/integrations/jobs', label: 'Job-Portale', icon: 'fa-briefcase' },
        { path: '/dashboard/integrations/email', label: 'E-Mail', icon: 'fa-envelope' },
        { path: '/dashboard/integrations/social', label: 'Social Media', icon: 'fa-share-alt' },
        { path: '/dashboard/integrations/calendar', label: 'Kalender', icon: 'fa-calendar-alt' },
      ]
    }
    
    // Standardinhalt, wenn keiner der obigen Pfade passt
    return []
  }

  const sidebarItems = getSidebarItems()
  const currentPageName = navItems.find(item => 
    pathname === item.path || (pathname?.startsWith(item.path) && item.path !== '/dashboard')
  )?.label || 'Dashboard'

  // HeiBa-spezifische Farben
  const colors = {
    gold: '#d4af37',
    darkBlue: '#154284',
    lightGray: '#f5f5f5',
    white: '#ffffff',
  }

  // Aktives Integrations-Menü für die Demonstrations-Karten
  const getIntegrationCards = () => {
    if (pathname?.includes('/dashboard/integrations')) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Job-Portale Karte */}
          <div className="bg-white rounded-md shadow border border-gray-200">
            <div className="h-10 bg-[#154284] rounded-t-md px-4 py-2 flex justify-between items-center">
              <h3 className="text-white font-bold">Job-Portale</h3>
              <div className="h-6 w-6 rounded-full bg-[#d4af37] flex items-center justify-center text-white text-xs">✓</div>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-700 mb-4">Stellenanzeigen auf verschiedenen Jobportalen verwalten und synchronisieren</p>
              <button className="px-4 py-2 rounded-full bg-[#154284] text-white text-sm hover:bg-[#0f3567] transition-colors">
                Konfigurieren
              </button>
            </div>
          </div>
          
          {/* E-Mail Integration Karte */}
          <div className="bg-white rounded-md shadow border border-gray-200">
            <div className="h-10 bg-[#154284] rounded-t-md px-4 py-2 flex justify-between items-center">
              <h3 className="text-white font-bold">E-Mail-Integration</h3>
              <div className="h-6 w-6 rounded-full bg-[#d4af37] flex items-center justify-center text-white text-xs">✓</div>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-700 mb-4">Automatisierte E-Mail-Benachrichtigungen und Kampagnen für Kandidaten</p>
              <button className="px-4 py-2 rounded-full bg-[#154284] text-white text-sm hover:bg-[#0f3567] transition-colors">
                Konfigurieren
              </button>
            </div>
          </div>
          
          {/* Social Media Karte */}
          <div className="bg-white rounded-md shadow border border-gray-200">
            <div className="h-10 bg-[#154284] rounded-t-md px-4 py-2 flex justify-between items-center">
              <h3 className="text-white font-bold">Social Media</h3>
              <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-[#154284] text-xs">-</div>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-700 mb-4">Integration mit LinkedIn, XING und anderen sozialen Netzwerken</p>
              <button className="px-4 py-2 rounded-full bg-white border border-[#154284] text-[#154284] text-sm hover:bg-gray-50 transition-colors">
                Aktivieren
              </button>
            </div>
          </div>
          
          {/* Kalender Karte */}
          <div className="bg-white rounded-md shadow border border-gray-200">
            <div className="h-10 bg-[#154284] rounded-t-md px-4 py-2 flex justify-between items-center">
              <h3 className="text-white font-bold">Kalender</h3>
              <div className="h-6 w-6 rounded-full bg-[#d4af37] flex items-center justify-center text-white text-xs">✓</div>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-700 mb-4">Sync mit Google Calendar, Outlook und anderen Kalender-Diensten</p>
              <button className="px-4 py-2 rounded-full bg-[#154284] text-white text-sm hover:bg-[#0f3567] transition-colors">
                Konfigurieren
              </button>
            </div>
          </div>
          
          {/* CRM-System Karte */}
          <div className="bg-white rounded-md shadow border border-gray-200">
            <div className="h-10 bg-[#154284] rounded-t-md px-4 py-2 flex justify-between items-center">
              <h3 className="text-white font-bold">CRM-System</h3>
              <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-[#154284] text-xs">-</div>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-700 mb-4">Integration mit CRM-Systemen wie Salesforce, HubSpot und anderen</p>
              <button className="px-4 py-2 rounded-full bg-white border border-[#154284] text-[#154284] text-sm hover:bg-gray-50 transition-colors">
                Aktivieren
              </button>
            </div>
          </div>
          
          {/* Video-Interviews Karte */}
          <div className="bg-white rounded-md shadow border border-gray-200">
            <div className="h-10 bg-[#154284] rounded-t-md px-4 py-2 flex justify-between items-center">
              <h3 className="text-white font-bold">Video-Interviews</h3>
              <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-[#154284] text-xs">-</div>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-700 mb-4">Integration mit Zoom, Microsoft Teams und anderen Videokonferenz-Tools</p>
              <button className="px-4 py-2 rounded-full bg-white border border-[#154284] text-[#154284] text-sm hover:bg-gray-50 transition-colors">
                Aktivieren
              </button>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // Layout-Rendering
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Oberster Bereich - Gold mit URL wie im SVG-Design */}
      <div className="w-full h-12 bg-[#d4af37] text-[#154284] flex items-center justify-center">
        <span className="text-sm font-semibold">WWW.HEIBA-PERSONAL.DE</span>
      </div>
      
      {/* Hauptnavigationsbereich - Dunkelblau mit Logo und Titel */}
      <div className="w-full bg-[#154284] text-white py-6">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between">
          {/* Logo und Kopfzeile - Links */}
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-12 h-12 rounded-md bg-white/20 p-1 flex items-center justify-center mr-3 shadow-md">
              <img src="/images/heiba-logo.jpg" alt="HeiBa Logo" className="w-full h-auto rounded" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">HeiBa RMS</h1>
              <p className="text-[#d4af37] text-sm italic">über 20 Jahre</p>
              <p className="text-xs font-bold tracking-wide">PERSONALVERMITTLUNG</p>
            </div>
          </div>
          
          {/* Aktueller Bereich mit goldener Unterstreichung - Mitte */}
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold mb-1 uppercase">{currentPageName}</h2>
            <div className="w-auto h-1.5 bg-[#d4af37] mb-2" style={{ minWidth: '100%' }}></div>
            <p className="text-sm">HeiBa RMS - Professionelles Recruiting leicht gemacht</p>
          </div>
          
          {/* Theme-Switcher - Rechts */}
          <div className="mt-4 md:mt-0">
            <ThemeSwitcher />
          </div>
        </div>
      </div>
      
      {/* Hauptnavigation - Hellgrau mit Unternavigation - fixiert */}
      <div className="w-full bg-[#f8f9fc] border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <nav className="flex flex-wrap justify-center">
            {navItems.map((item) => {
              const isActive = pathname === item.path || (pathname?.startsWith(item.path) && item.path !== '/dashboard');
              return (
                <Link 
                  key={item.path}
                  href={item.path}
                  className={`whitespace-nowrap flex items-center px-2 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-[#154284] font-bold border-b-3 border-[#d4af37]'
                      : 'text-gray-600 hover:text-[#154284]'
                  }`}
                >
                  <i className={`fas ${item.icon} mr-1 ${isActive ? 'text-[#154284]' : 'text-gray-400'}`}></i>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      
      {/* Hauptinhaltsbereich mit optionaler Sidebar - genau wie im SVG */}
      <div className="flex-grow container mx-auto px-4 py-6">
        {/* Beschreibungstext für Integrationsseite */}
        {pathname?.includes('/dashboard/integrations') && (
          <p className="text-gray-600 mb-6">Verbinden Sie HeiBa mit anderen Diensten und Plattformen.</p>
        )}
        
        {/* Integrationen-Karten für spezielles Layout */}
        {getIntegrationCards()}
        
        {/* Flexibler Bereich mit Sidebar und Inhalt */}
        <div className="flex flex-col md:flex-row">
          {/* Seitliche Navigation auf bestimmten Seiten */}
          {sidebarItems.length > 0 && (
            <div className="w-full md:w-64 mb-6 md:mb-0 md:mr-6">
              <div className="bg-[#f5f5f5] rounded p-4">
                <h3 className="font-bold text-[#154284] mb-1">Übersicht</h3>
                {/* Goldene Unterstreichung für aktiven Titel */}
                <div className="w-20 h-0.5 bg-[#d4af37] mb-4"></div>
                
                <nav className="space-y-1">
                  {sidebarItems.map((item, index) => {
                    const isActive = pathname === item.path || (item.path.includes('?') && pathname === item.path.split('?')[0]);
                    return (
                      <React.Fragment key={item.path}>
                        <Link
                          href={item.path}
                          className={`block py-2 px-3 text-sm ${
                            isActive ? 'font-medium text-[#154284]' : 'text-gray-600 hover:text-[#154284]'
                          }`}
                        >
                          <i className={`fas ${item.icon} mr-2 ${isActive ? 'text-[#154284]' : 'text-gray-400'}`}></i>
                          {item.label}
                        </Link>
                        {index < sidebarItems.length - 1 && <div className="border-t border-gray-200 my-1"></div>}
                      </React.Fragment>
                    );
                  })}
                </nav>
              </div>
            </div>
          )}
          
          {/* Hauptinhalt */}
          <div className={`flex-grow ${sidebarItems.length > 0 ? 'md:max-w-[calc(100%-280px)]' : 'w-full'}`}>
            {children}
          </div>
        </div>
      </div>
      
      {/* Footer mit Copyright */}
      <footer className="w-full bg-[#f5f5f5] py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} HeiBa Personalvermittlung - Alle Rechte vorbehalten
        </div>
      </footer>
    </div>
  )
}
