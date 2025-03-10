'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigationItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/kandidaten', label: 'Kandidaten' },
  { path: '/stellen', label: 'Stellen' },
  { path: '/matching', label: 'Matching' },
  { path: '/portals', label: 'Portale' },
  { path: '/berichte', label: 'Berichte' }
]

export default function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-heiba-blue">HeiBa</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm ${
                  isActive(item.path)
                    ? 'text-heiba-blue font-medium'
                    : 'text-gray-600 hover:text-heiba-blue'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-heiba-blue">
              <i className="fas fa-search"></i>
            </button>
            <button className="text-gray-600 hover:text-heiba-blue relative">
              <i className="fas fa-bell"></i>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </button>
            <Link
              href="/neue-bewerbung"
              className="bg-heiba-gold text-white px-4 py-2 rounded-lg hover:bg-[#C19B20] transition-colors"
            >
              + Neue Bewerbung
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
