'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import SidebarAlternative from '@/components/layout/SidebarAlternative'
import { NotificationBell } from '@/components/ui/NotificationBell'
import { RealtimeProvider } from '@/components/realtime/RealtimeProvider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [user, setUser] = useState<{ name: string } | null>(null)
  
  // Simuliere einen eingeloggten Benutzer
  useEffect(() => {
    setUser({ name: 'Admin' })
  }, [])

  // Navigation-Items - Neue Reihenfolge gemäß Anforderungen
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'fa-home' },
    { path: '/dashboard/applications', label: 'Bewerbungen', icon: 'fa-file-alt' },
    { path: '/dashboard/talent-pool', label: 'Talent-Pool', icon: 'fa-users' },
    { path: '/dashboard/candidates', label: 'Kandidaten', icon: 'fa-user' },
    { path: '/dashboard/matching', label: 'Matching', icon: 'fa-link' },
    { path: '/dashboard/customers', label: 'Kunden', icon: 'fa-building' },
    { path: '/dashboard/jobs', label: 'Jobs', icon: 'fa-briefcase' },
    { path: '/dashboard/notifications', label: 'Benachrichtigungen', icon: 'fa-bell' },
    { path: '/dashboard/task-automation', label: 'Aufgabenautomatisierung', icon: 'fa-tasks' },
    { path: '/dashboard/reports', label: 'Berichte', icon: 'fa-chart-bar' },
    { path: '/dashboard/integrations', label: 'Integrationen', icon: 'fa-plug' },
    { path: '/dashboard/settings', label: 'Einstellungen', icon: 'fa-cog' },
  ]

  // Aktueller Menüpunkt
  const currentNavItem = navItems.find(item => 
    pathname === item.path || (pathname?.startsWith(item.path) && item.path !== '/dashboard')
  ) || navItems[0];

  return (
    <RealtimeProvider>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Fixierter Header-Bereich */}
        <div className="sticky top-0 z-20 w-full">
          {/* Gold-Balken oben - Jetzt einheitliche Farbe ohne Verläufe oder Schatten */}
          <div className="w-full h-8 bg-[var(--accent)]"></div>
          
          {/* Blauer Header-Bereich mit klarer Diagonale und Schatten */}
          <div className="w-full h-32 relative overflow-hidden" 
               style={{
                 boxShadow: 'inset 0 -10px 15px -5px rgba(0,0,0,0.5)' /* Innerer Schatten unten */
               }}>
            {/* Diagonale Trennung mit klarer Linie */}
            <div className="absolute top-0 left-0 right-0 bottom-0 z-10"
                 style={{
                   background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--primary-light) 47%, rgba(8, 43, 92, 0.7) 48%, rgba(5, 32, 74, 0.7) 49%, var(--primary-dark) 50%, var(--primary-dark) 100%)'
                 }}>
            </div>
            
            {/* Welleneffekt als zusätzlicher Schatten */}
            <div className="absolute top-0 left-0 right-0 bottom-0 z-20"
                 style={{
                   background: 'linear-gradient(135deg, transparent 44%, rgba(0,0,0,0.05) 46%, rgba(0,0,0,0.1) 47%, rgba(255,255,255,0.15) 48%, rgba(255,255,255,0.12) 49%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.05) 51%, transparent 54%)',
                   boxShadow: 'inset 5px -5px 15px 0px rgba(0,0,0,0.3)' /* Verstärkter Schatten in der Ecke */
                 }}>
            </div>

            <div className="container mx-auto px-4 h-full flex flex-col md:flex-row justify-between items-center relative z-10">
              {/* Logo - Rundes Design */}
              <div className="flex items-center mb-4 md:mb-0">
                <div className="w-24 h-24 flex items-center justify-center mr-3 rounded-full overflow-hidden border-2 border-white/30 shadow-md">
                  <img src="/images/heiba-logo.jpg" alt="HeiBa Logo" className="w-full h-full object-cover" />
                </div>
              </div>
              
              {/* Seitentitel in der Mitte mit goldener Unterstreichung */}
              <div className="flex flex-col items-center mb-4 md:mb-0">
                <h2 className="text-2xl font-bold uppercase tracking-wide text-white">
                  {currentNavItem.label}
                </h2>
                <div className="w-auto h-1 bg-[var(--accent)] mb-2 shadow-md" style={{ minWidth: '100%' }}></div>
                <p className="text-sm text-white/80 font-light tracking-wide">
                  HeiBa RMS - Professionelles Recruiting leicht gemacht
                </p>
              </div>
              
              {/* Rechter Bereich */}
              <div className="hidden sm:block"> {/* Versteckt auf Mobile */}
                {/* Hier könnte Benutzerinfo oder ähnliches stehen */}
              </div>
            </div>
          </div>
          
          {/* Hauptnavigation */}
          <div className="w-full bg-white border-b border-gray-200 shadow-sm">
            <div className="container mx-auto px-4">
              <nav className="flex flex-wrap justify-center md:justify-start">
                {navItems.map((item) => {
                  const isActive = pathname === item.path || (pathname?.startsWith(item.path) && item.path !== '/dashboard');
                  return (
                    <Link 
                      key={item.path}
                      href={item.path}
                      className={`whitespace-nowrap flex items-center px-3 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-[var(--primary-dark)] font-bold border-b-2 border-[var(--accent)]'
                          : 'text-gray-600 hover:text-[var(--primary-dark)]'
                      }`}
                    >
                      <i className={`fas ${item.icon} mr-1.5 ${isActive ? 'text-[var(--primary-dark)]' : 'text-gray-400'}`}></i>
                      {item.label}
                    </Link>
                  );
                })}
                
                {/* Suche rechts */}
                <div className="ml-auto flex items-center">
                  <div className="relative mr-3">
                    <input 
                      type="text" 
                      placeholder="Suchen..." 
                      className="input-field px-3 py-1.5 pl-8 text-xs rounded-full border focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    />
                    <i className="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                  </div>
                  
                  {/* Echtzeit-Benachrichtigungen */}
                  <NotificationBell />
                </div>
              </nav>
            </div>
          </div>
        </div>
        
        {/* Hauptinhalt mit fixierter Sidebar */}
        <div className="flex flex-1 relative">
          {/* Fixierte Sidebar */}
          <div className="w-56 bg-white shadow-md py-4 hidden md:block fixed top-[calc(var(--header-offset))] h-[calc(100vh-var(--header-offset))] left-0 overflow-y-auto" 
               style={{ "--header-offset": "175px" } as React.CSSProperties}>
            <SidebarAlternative pathPrefix="/dashboard" />
          </div>
          
          {/* Hauptinhalt mit Abstand für Sidebar */}
          <div className="flex-1 p-6 md:ml-56 bg-[var(--background)]">
            <div className="card p-6 bg-white rounded-lg shadow-md">
              {children}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="w-full bg-white border-t border-gray-200 py-4">
          <div className="container mx-auto px-4 text-center text-sm text-gray-600">
            &copy; {new Date().getFullYear()} HeiBa Personalvermittlung - Alle Rechte vorbehalten
          </div>
        </footer>
      </div>
    </RealtimeProvider>
  )
}
