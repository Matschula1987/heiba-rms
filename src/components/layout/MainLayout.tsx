// src/components/layout/MainLayout.tsx
import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  
  // Prüfen, ob wir auf der Login-Seite sind
  const isLoginPage = pathname === '/login' || pathname === '/register';
  
  // Wenn wir auf der Login-Seite sind, zeigen wir nur den Inhalt ohne Header/Footer
  if (isLoginPage) {
    return <>{children}</>;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-heiba-blue text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <span className="text-heiba-blue font-bold text-lg">HB</span>
            </div>
            <span className="font-bold text-xl">HeiBa Recruitment</span>
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <NavLink href="/dashboard" active={pathname === '/dashboard'}>Dashboard</NavLink>
            <NavLink href="/candidates" active={pathname.startsWith('/candidates')}>Kandidaten</NavLink>
            <NavLink href="/jobs" active={pathname.startsWith('/jobs')}>Jobs</NavLink>
            <NavLink href="/settings" active={pathname.startsWith('/settings')}>Einstellungen</NavLink>
          </nav>
          
          <div className="flex items-center space-x-4">
            <button className="hover:text-heiba-gold transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="h-8 w-8 rounded-full bg-heiba-gold flex items-center justify-center">
              <span className="text-white font-medium text-sm">AB</span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="bg-gray-100 border-t border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600 text-sm">© {new Date().getFullYear()} HeiBa Recruitment System</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/privacy" className="text-gray-600 hover:text-heiba-blue text-sm">Datenschutz</Link>
              <Link href="/terms" className="text-gray-600 hover:text-heiba-blue text-sm">AGB</Link>
              <Link href="/contact" className="text-gray-600 hover:text-heiba-blue text-sm">Kontakt</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// NavLink-Komponente für aktive Menüpunkte
function NavLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link 
      href={href} 
      className={`transition-colors ${active ? 'text-heiba-gold font-medium' : 'hover:text-heiba-gold'}`}
    >
      {children}
    </Link>
  );
}
