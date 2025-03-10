'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 fixed left-0 top-40 bottom-0 bg-[#002451] overflow-y-auto">
      <nav className="p-4">
        <div className="space-y-1">
          {pathname?.includes('/dashboard/candidates') && (
            <>
              <Link
                href="/dashboard/candidates"
                className={`block px-4 py-3 text-white/80 hover:text-white transition-colors relative
                  ${pathname === '/dashboard/candidates' ? 'border-b-2 border-[#B8860B] font-medium text-white' : 'hover:border-b-2 hover:border-[#B8860B]'}`}
              >
                Übersicht
              </Link>
              <Link
                href="/dashboard/candidates/new"
                className={`block px-4 py-3 text-white/80 hover:text-white transition-colors relative
                  ${pathname === '/dashboard/candidates/new' ? 'border-b-2 border-[#B8860B] font-medium text-white' : 'hover:border-b-2 hover:border-[#B8860B]'}`}
              >
                Neuer Kandidat
              </Link>
              <Link
                href="/dashboard/candidates/active"
                className={`block px-4 py-3 text-white/80 hover:text-white transition-colors relative
                  ${pathname === '/dashboard/candidates/active' ? 'border-b-2 border-[#B8860B] font-medium text-white' : 'hover:border-b-2 hover:border-[#B8860B]'}`}
              >
                Aktive Kandidaten
              </Link>
              <Link
                href="/dashboard/candidates/archived"
                className={`block px-4 py-3 text-white/80 hover:text-white transition-colors relative
                  ${pathname === '/dashboard/candidates/archived' ? 'border-b-2 border-[#B8860B] font-medium text-white' : 'hover:border-b-2 hover:border-[#B8860B]'}`}
              >
                Archivierte
              </Link>
            </>
          )}

          {/* Neue Sektion für Kunden & Interessenten */}
          {pathname?.includes('/dashboard/customers') && (
            <>
              <Link
                href="/dashboard/customers"
                className={`block px-4 py-3 text-white/80 hover:text-white transition-colors relative
                  ${pathname === '/dashboard/customers' ? 'border-b-2 border-[#B8860B] font-medium text-white' : 'hover:border-b-2 hover:border-[#B8860B]'}`}
              >
                Übersicht
              </Link>
              <Link
                href="/dashboard/customers/new?type=customer"
                className={`block px-4 py-3 text-white/80 hover:text-white transition-colors relative
                  ${pathname === '/dashboard/customers/new' && !pathname.includes('prospect') ? 'border-b-2 border-[#B8860B] font-medium text-white' : 'hover:border-b-2 hover:border-[#B8860B]'}`}
              >
                Neuer Kunde
              </Link>
              <Link
                href="/dashboard/customers/new?type=prospect"
                className={`block px-4 py-3 text-white/80 hover:text-white transition-colors relative
                  ${pathname === '/dashboard/customers/new' && pathname.includes('prospect') ? 'border-b-2 border-[#B8860B] font-medium text-white' : 'hover:border-b-2 hover:border-[#B8860B]'}`}
              >
                Neuer Interessent
              </Link>
              <Link
                href="/dashboard/customers/active"
                className={`block px-4 py-3 text-white/80 hover:text-white transition-colors relative
                  ${pathname === '/dashboard/customers/active' ? 'border-b-2 border-[#B8860B] font-medium text-white' : 'hover:border-b-2 hover:border-[#B8860B]'}`}
              >
                Aktive Kunden
              </Link>
              <Link
                href="/dashboard/customers/prospects"
                className={`block px-4 py-3 text-white/80 hover:text-white transition-colors relative
                  ${pathname === '/dashboard/customers/prospects' ? 'border-b-2 border-[#B8860B] font-medium text-white' : 'hover:border-b-2 hover:border-[#B8860B]'}`}
              >
                Interessenten
              </Link>
            </>
          )}

          {pathname?.includes('/dashboard/jobs') && (
            <>
              <Link
                href="/dashboard/jobs"
                className={`block px-4 py-3 text-white/80 hover:text-white transition-colors relative
                  ${pathname === '/dashboard/jobs' ? 'border-b-2 border-[#B8860B] font-medium text-white' : 'hover:border-b-2 hover:border-[#B8860B]'}`}
              >
                Übersicht
              </Link>
              <Link
                href="/dashboard/jobs/new"
                className={`block px-4 py-3 text-white/80 hover:text-white transition-colors relative
                  ${pathname === '/dashboard/jobs/new' ? 'border-b-2 border-[#B8860B] font-medium text-white' : 'hover:border-b-2 hover:border-[#B8860B]'}`}
              >
                Neue Stelle
              </Link>
              {/* ... weitere Job-Links ... */}
            </>
          )}
          
          {pathname?.includes('/dashboard/matching') && (
            <>
              <Link
                href="/dashboard/matching"
                className={`block px-4 py-3 text-white/80 hover:text-white transition-colors relative
                  ${pathname === '/dashboard/matching' ? 'border-b-2 border-[#B8860B] font-medium text-white' : 'hover:border-b-2 hover:border-[#B8860B]'}`}
              >
                Übersicht
              </Link>
              <Link
                href="/dashboard/matching/manual"
                className={`block px-4 py-3 text-white/80 hover:text-white transition-colors relative
                  ${pathname === '/dashboard/matching/manual' ? 'border-b-2 border-[#B8860B] font-medium text-white' : 'hover:border-b-2 hover:border-[#B8860B]'}`}
              >
                Manuelles Matching
              </Link>
            </>
          )}
          
          {pathname?.includes('/dashboard/reports') && (
            <>
              <Link
                href="/dashboard/reports"
                className={`block px-4 py-3 text-white/80 hover:text-white transition-colors relative
                  ${(pathname === '/dashboard/reports' || pathname?.includes('overview')) ? 'border-b-2 border-[#B8860B] font-medium text-white' : 'hover:border-b-2 hover:border-[#B8860B]'}`}
              >
                Übersicht
              </Link>
              <Link
                href="/dashboard/reports/details"
                className={`block px-4 py-3 text-white/80 hover:text-white transition-colors relative
                  ${pathname?.includes('details') ? 'border-b-2 border-[#B8860B] font-medium text-white' : 'hover:border-b-2 hover:border-[#B8860B]'}`}
              >
                Stellendetails
              </Link>
              <Link
                href="/dashboard/reports/location"
                className={`block px-4 py-3 text-white/80 hover:text-white transition-colors relative
                  ${pathname?.includes('location') ? 'border-b-2 border-[#B8860B] font-medium text-white' : 'hover:border-b-2 hover:border-[#B8860B]'}`}
              >
                Standorte
              </Link>
            </>
          )}
          
          {pathname?.includes('/dashboard/settings') && (
            <>
              <Link
                href="/dashboard/settings"
                className={`block px-4 py-3 text-white/80 hover:text-white transition-colors relative
                  ${pathname === '/dashboard/settings' ? 'border-b-2 border-[#B8860B] font-medium text-white' : 'hover:border-b-2 hover:border-[#B8860B]'}`}
              >
                Allgemein
              </Link>
              <Link
                href="/dashboard/settings/notifications"
                className={`block px-4 py-3 text-white/80 hover:text-white transition-colors relative
                  ${pathname?.includes('/dashboard/settings/notifications') ? 'border-b-2 border-[#B8860B] font-medium text-white' : 'hover:border-b-2 hover:border-[#B8860B]'}`}
              >
                Benachrichtigungen
              </Link>
              <Link
                href="/dashboard/settings/privacy"
                className={`block px-4 py-3 text-white/80 hover:text-white transition-colors relative
                  ${pathname?.includes('/dashboard/settings/privacy') ? 'border-b-2 border-[#B8860B] font-medium text-white' : 'hover:border-b-2 hover:border-[#B8860B]'}`}
              >
                Datenschutz
              </Link>
              <Link
                href="/dashboard/settings/account"
                className={`block px-4 py-3 text-white/80 hover:text-white transition-colors relative
                  ${pathname?.includes('/dashboard/settings/account') ? 'border-b-2 border-[#B8860B] font-medium text-white' : 'hover:border-b-2 hover:border-[#B8860B]'}`}
              >
                Benutzer & Teams
              </Link>
            </>
          )}
          
          {pathname?.includes('/dashboard/integrations') && (
            <>
              <Link
                href="/dashboard/integrations"
                className={`block px-4 py-3 text-white/80 hover:text-white transition-colors relative
                  ${pathname === '/dashboard/integrations' ? 'border-b-2 border-[#B8860B] font-medium text-white' : 'hover:border-b-2 hover:border-[#B8860B]'}`}
              >
                Übersicht
              </Link>
              <Link
                href="/dashboard/integrations/jobs"
                className={`block px-4 py-3 text-white/80 hover:text-white transition-colors relative
                  ${pathname?.includes('/dashboard/integrations/jobs') ? 'border-b-2 border-[#B8860B] font-medium text-white' : 'hover:border-b-2 hover:border-[#B8860B]'}`}
              >
                Job-Portale
              </Link>
              <Link
                href="/dashboard/integrations/email"
                className={`block px-4 py-3 text-white/80 hover:text-white transition-colors relative
                  ${pathname?.includes('/dashboard/integrations/email') ? 'border-b-2 border-[#B8860B] font-medium text-white' : 'hover:border-b-2 hover:border-[#B8860B]'}`}
              >
                E-Mail
              </Link>
              <Link
                href="/dashboard/integrations/social"
                className={`block px-4 py-3 text-white/80 hover:text-white transition-colors relative
                  ${pathname?.includes('/dashboard/integrations/social') ? 'border-b-2 border-[#B8860B] font-medium text-white' : 'hover:border-b-2 hover:border-[#B8860B]'}`}
              >
                Social Media
              </Link>
              <Link
                href="/dashboard/integrations/calendar"
                className={`block px-4 py-3 text-white/80 hover:text-white transition-colors relative
                  ${pathname?.includes('/dashboard/integrations/calendar') ? 'border-b-2 border-[#B8860B] font-medium text-white' : 'hover:border-b-2 hover:border-[#B8860B]'}`}
              >
                Kalender
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  )
}
