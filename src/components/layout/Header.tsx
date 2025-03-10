import React from 'react'
import Link from 'next/link'
import { UserCircle } from 'lucide-react'
import { NotificationBell } from '@/components/ui/NotificationBell'
import LanguageSelector from '@/components/ui/LanguageSelector'
import Image from 'next/image'

const Header = () => {
  return (
    <div className="header-container">
      {/* Gold-Balken am oberen Rand */}
      <div className="h-2 w-full bg-[var(--accent)] opacity-100"></div>
      
      {/* Header mit diagonalem Farbverlauf und Trennlinie */}
      <header className="text-white relative overflow-hidden">
        {/* Hintergrund mit diagonalem Farbverlauf */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary-dark)]"></div>
        
        {/* Diagonale Trennlinie mit Schatteneffekt */}
        <div className="absolute w-[150%] h-0.5 bg-white/10 shadow-diagonal transform rotate-[-35deg] translate-y-24 -translate-x-10"></div>
        <div className="absolute w-[150%] h-0.5 bg-black/10 shadow-diagonal transform rotate-[-35deg] translate-y-[98px] -translate-x-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <Link href="/" className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden p-1.5 mr-2">
                <img 
                  src="/images/heiba-logo.jpg" 
                  alt="HeiBa Logo" 
                  className="w-10 h-10 object-cover object-center"
                />
              </div>
              <span className="text-[var(--accent)] font-bold text-xl">HeiBa</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/dashboard" className="hover:text-[var(--accent)] transition-colors">
                Dashboard
              </Link>
              <Link href="/dashboard/jobs" className="hover:text-[var(--accent)] transition-colors">
                Jobs
              </Link>
              <Link href="/dashboard/candidates" className="hover:text-[var(--accent)] transition-colors">
                Kandidaten
              </Link>
              <Link href="/dashboard/applications" className="hover:text-[var(--accent)] transition-colors">
                Bewerbungen
              </Link>
              <Link href="/dashboard/tasks" className="hover:text-[var(--accent)] transition-colors">
                Aufgaben
              </Link>
              <Link href="/dashboard/talent-pool" className="hover:text-[var(--accent)] transition-colors">
                Talent-Pool
              </Link>
              <Link href="/dashboard/customers" className="hover:text-[var(--accent)] transition-colors">
                Kunden
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <LanguageSelector variant="compact" />
              <NotificationBell />
              <button className="p-2 hover:text-[var(--accent)] transition-colors">
                <UserCircle className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}

export default Header
