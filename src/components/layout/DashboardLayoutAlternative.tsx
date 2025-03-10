'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import SidebarAlternative from './SidebarAlternative'
import { useTheme } from '@/lib/ThemeContext'

export default function DashboardLayoutAlternative({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { toggleTheme } = useTheme()

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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Seitliche Navigation (Desktop) - fixiert */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white shadow-md z-20">
        {/* Logo/Branding-Bereich */}
        <div className="px-6 py-6 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-md bg-white/20 p-1 flex items-center justify-center shadow-md">
              <img src="/images/heiba-logo.jpg" alt="HeiBa Logo" className="w-full h-auto rounded" />
            </div>
            <span className="ml-3 text-xl font-semibold text-gray-900">HeiBa RMS</span>
          </div>
          <button
            onClick={toggleTheme}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            title="Layout wechseln"
          >
            <i className="fas fa-exchange-alt"></i>
          </button>
        </div>

        {/* Hauptnavigation */}
        <div className="flex-grow flex flex-col justify-between py-4 overflow-y-auto">
          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                href={item.path}
                className={`
                  flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${pathname === item.path || (item.path !== '/dashboard' && pathname?.startsWith(item.path)) 
                    ? 'bg-[#002451]/10 text-[#002451]' 
                    : 'text-gray-600 hover:bg-gray-100'}
                `}
              >
                <i className={`fas ${item.icon} mr-3 text-lg ${pathname === item.path || (item.path !== '/dashboard' && pathname?.startsWith(item.path)) ? 'text-[#002451]' : 'text-gray-400'}`}></i>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Benutzer-Profil */}
          <div className="px-4 mt-6">
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-[#B8860B] flex items-center justify-center text-white">
                  <i className="fas fa-user"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100">
                <Link
                  href="/logout"
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900 py-2"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Abmelden
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden bg-white w-full fixed top-0 left-0 right-0 z-10 border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-md bg-white/20 p-1 flex items-center justify-center shadow-sm">
              <img src="/images/heiba-logo.jpg" alt="HeiBa Logo" className="w-full h-auto rounded" />
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-900">HeiBa</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>

        {/* Mobile-Menü */}
        {isMobileMenuOpen && (
          <div className="bg-white border-b border-gray-200 shadow-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link 
                  key={item.path}
                  href={item.path}
                  className={`
                    flex items-center px-3 py-2 rounded-md text-base font-medium
                    ${pathname === item.path || (item.path !== '/dashboard' && pathname?.startsWith(item.path)) 
                      ? 'bg-[#002451]/10 text-[#002451]' 
                      : 'text-gray-600 hover:bg-gray-100'}
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className={`fas ${item.icon} mr-3 ${pathname === item.path || (item.path !== '/dashboard' && pathname?.startsWith(item.path)) ? 'text-[#002451]' : 'text-gray-400'}`}></i>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hauptinhalt */}
      <div className="flex-1 md:ml-64">
        {/* Hauptcontent mit responsivem Padding für Mobile/Desktop */}
        <main className="py-6 md:py-8 px-4 md:px-8 mt-14 md:mt-0">
          {/* Header für Hauptinhalt */}
          <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Willkommen zurück, {user?.name || 'Admin'}!
              </h1>
              <p className="text-gray-600 mt-1">
                Hier ist ein Überblick über das HeiBa Recruitment System.
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
            >
              <i className="fas fa-paint-brush mr-2"></i>
              Original-Layout
            </button>
          </div>
          </div>

          {/* Dynamischer Sidebar-Bereich */}
          <div className="flex flex-col md:flex-row">
            <SidebarAlternative />
            {/* Hauptinhalt */}
            <div className="flex-1 md:pl-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
