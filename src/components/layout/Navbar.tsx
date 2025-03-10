'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Briefcase, UserCircle, Building2, BarChart, Settings, Globe, LogOut } from 'lucide-react'

const Navbar = () => {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#002451] text-white">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/dashboard" className="text-xl font-bold flex items-center">
            <span className="text-[#D4AF37] mr-2">HeiBa</span>
            <span className="font-light">Recruitment</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-1">
          <NavItem 
            href="/dashboard" 
            label="Dashboard" 
            icon={<BarChart className="h-4 w-4 mr-1" />} 
            active={pathname === '/dashboard'} 
          />
          
          <NavItem 
            href="/dashboard/candidates" 
            label="Kandidaten" 
            icon={<User className="h-4 w-4 mr-1" />} 
            active={pathname?.includes('/dashboard/candidates')} 
          />
          
          <NavItem 
            href="/dashboard/customers" 
            label="Kunden" 
            icon={<Building2 className="h-4 w-4 mr-1" />} 
            active={pathname?.includes('/dashboard/customers')} 
          />
          
          <NavItem 
            href="/dashboard/jobs" 
            label="Jobs" 
            icon={<Briefcase className="h-4 w-4 mr-1" />} 
            active={pathname?.includes('/dashboard/jobs')} 
          />
          
          <NavItem 
            href="/dashboard/matching" 
            label="Matching" 
            icon={<Globe className="h-4 w-4 mr-1" />} 
            active={pathname?.includes('/dashboard/matching')} 
          />
          
          <NavItem 
            href="/dashboard/reports" 
            label="Berichte" 
            icon={<BarChart className="h-4 w-4 mr-1" />} 
            active={pathname?.includes('/dashboard/reports')} 
          />
          
          <NavItem 
            href="/dashboard/settings" 
            label="Einstellungen" 
            icon={<Settings className="h-4 w-4 mr-1" />} 
            active={pathname?.includes('/dashboard/settings')} 
          />
        </nav>
        
        <div className="flex items-center">
          <button className="p-2 hover:bg-[#002451]/80 rounded-full transition-colors flex items-center">
            <UserCircle className="h-6 w-6 mr-2" />
            <span className="hidden md:block">Admin</span>
          </button>
          <button className="p-2 hover:bg-[#002451]/80 rounded-full ml-2 hidden md:flex items-center text-gray-300 hover:text-white">
            <LogOut className="h-5 w-5 mr-1" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}

interface NavItemProps {
  href: string
  label: string
  icon: React.ReactNode
  active: boolean
}

const NavItem: React.FC<NavItemProps> = ({ href, label, icon, active }) => {
  return (
    <Link 
      href={href}
      className={`px-3 py-2 rounded-md flex items-center ${
        active 
          ? 'bg-[#001c40] text-white' 
          : 'text-gray-300 hover:bg-[#001c40] hover:text-white'
      } transition-colors text-sm font-medium`}
    >
      {icon}
      {label}
    </Link>
  )
}

export default Navbar
