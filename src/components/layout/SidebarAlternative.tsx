'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarAlternativeProps {
  pathPrefix?: string;
}

interface SidebarLink {
  path: string;
  label: string;
  icon: string;
  isAction?: boolean;
  onClick?: () => void;
}

export default function SidebarAlternative({ pathPrefix = '/dashboard' }: SidebarAlternativeProps) {
  const pathname = usePathname()

  // Kontextbasierte Sidebar-Links je nach aktueller Seite
  const getSidebarLinks = (): SidebarLink[] => {
    if (pathname?.includes(`${pathPrefix}/candidates`)) {
      return [
        { path: `${pathPrefix}/candidates`, label: 'Übersicht', icon: 'fa-home' },
        { path: `${pathPrefix}/candidates/new`, label: 'Neuer Kandidat', icon: 'fa-user-plus' },
        { path: `${pathPrefix}/candidates/active`, label: 'Aktive Kandidaten', icon: 'fa-users' },
        { path: `${pathPrefix}/candidates/archived`, label: 'Archivierte', icon: 'fa-archive' }
      ]
    }
    
    if (pathname?.includes(`${pathPrefix}/customers`)) {
      return [
        { path: `${pathPrefix}/customers`, label: 'Übersicht', icon: 'fa-home' },
        { path: `${pathPrefix}/customers/new?type=customer`, label: 'Neuer Kunde', icon: 'fa-building' },
        { path: `${pathPrefix}/customers/new?type=prospect`, label: 'Neuer Interessent', icon: 'fa-user-tie' },
        { path: `${pathPrefix}/customers/active`, label: 'Aktive Kunden', icon: 'fa-briefcase' },
        { path: `${pathPrefix}/customers/prospects`, label: 'Interessenten', icon: 'fa-handshake' }
      ]
    }
    
    if (pathname?.includes(`${pathPrefix}/jobs`) || pathname?.includes(`${pathPrefix}/job-templates`)) {
      return [
        { path: `${pathPrefix}/jobs`, label: 'Übersicht', icon: 'fa-home' },
        { path: `${pathPrefix}/jobs/new`, label: 'Neue Stelle', icon: 'fa-plus-circle' },
        { path: `${pathPrefix}/job-templates`, label: 'Textbausteine', icon: 'fa-file-alt' }
      ]
    }
    
    if (pathname?.includes(`${pathPrefix}/matching`)) {
      return [
        { path: `${pathPrefix}/matching`, label: 'Übersicht', icon: 'fa-home' },
        { path: `${pathPrefix}/matching/internal`, label: 'Internes Matching', icon: 'fa-building' },
        { path: `${pathPrefix}/matching/external`, label: 'Externes Matching', icon: 'fa-globe' },
        { path: `${pathPrefix}/matching/settings`, label: 'Einstellungen', icon: 'fa-cog' }
      ]
    }
    
    if (pathname?.includes(`${pathPrefix}/reports`)) {
      return [
        { path: `${pathPrefix}/reports`, label: 'Übersicht', icon: 'fa-home' },
        { path: `${pathPrefix}/reports/details`, label: 'Stellendetails', icon: 'fa-file-alt' },
        { path: `${pathPrefix}/reports/location`, label: 'Standorte', icon: 'fa-map-marker-alt' }
      ]
    }
    
    if (pathname?.includes(`${pathPrefix}/settings`)) {
      return [
        { path: `${pathPrefix}/settings`, label: 'Allgemein', icon: 'fa-cog' },
        { path: `${pathPrefix}/settings/notifications`, label: 'Benachrichtigungen', icon: 'fa-bell' },
        { path: `${pathPrefix}/settings/scheduler`, label: 'Scheduler', icon: 'fa-calendar-alt' },
        { path: `${pathPrefix}/settings/language`, label: 'Sprache', icon: 'fa-language' },
        { path: `${pathPrefix}/settings/privacy`, label: 'Datenschutz', icon: 'fa-shield-alt' },
        { path: `${pathPrefix}/settings/users`, label: 'Benutzer & Teams', icon: 'fa-users-cog' }
      ]
    }
    
    if (pathname?.includes(`${pathPrefix}/tasks`)) {
      return [
        { path: `${pathPrefix}/tasks`, label: 'Übersicht', icon: 'fa-home' },
        { path: `${pathPrefix}/tasks/new`, label: 'Neue Aufgabe', icon: 'fa-plus-circle' },
        { path: `${pathPrefix}/tasks?status=completed`, label: 'Abgeschlossene', icon: 'fa-check-circle' },
        { path: `${pathPrefix}/task-automation`, label: 'Automatisierung', icon: 'fa-tasks' }
      ]
    }
    
    if (pathname?.includes(`${pathPrefix}/task-automation`)) {
      return [
        { path: `${pathPrefix}/task-automation`, label: 'Automatisierung', icon: 'fa-tasks' },
        { path: `${pathPrefix}/tasks`, label: 'Zu Aufgaben', icon: 'fa-list' }
      ]
    }
    
    if (pathname?.includes(`${pathPrefix}/applications`)) {
      return [
        { path: `${pathPrefix}/applications`, label: 'Übersicht', icon: 'fa-home' },
        { path: `${pathPrefix}/applications/new`, label: 'Neue Bewerbung', icon: 'fa-plus-circle' },
        { path: `${pathPrefix}/applications/archived`, label: 'Archivierte', icon: 'fa-archive' }
      ]
    }
    
    if (pathname?.includes(`${pathPrefix}/talent-pool`)) {
      return [
        { path: `${pathPrefix}/talent-pool`, label: 'Übersicht', icon: 'fa-home' },
        { path: `${pathPrefix}/applications?to_pool=true`, label: 'Bewerber hinzufügen', icon: 'fa-user-plus' },
        { path: `${pathPrefix}/candidates?to_pool=true`, label: 'Kandidaten hinzufügen', icon: 'fa-users' },
      ]
    }
    
    if (pathname?.includes(`${pathPrefix}/integrations`)) {
      return [
        { path: `${pathPrefix}/integrations`, label: 'Übersicht', icon: 'fa-list' },
        { path: `${pathPrefix}/integrations/job-portals`, label: 'Job-Portale', icon: 'fa-globe' },
        { path: `${pathPrefix}/integrations/social-media`, label: 'Social Media', icon: 'fa-share-alt' },
        { path: `${pathPrefix}/integrations/monica-ai`, label: 'Monica AI', icon: 'fa-robot' },
        { path: `${pathPrefix}/integrations/talent360`, label: 'Talent360', icon: 'fa-user-tie' },
        { path: `${pathPrefix}/integrations/api`, label: 'API-Zugriff', icon: 'fa-key' },
        { path: `${pathPrefix}/integrations/connections`, label: 'Verbindungen', icon: 'fa-plug' },
        { path: `${pathPrefix}/integrations/settings`, label: 'Einstellungen', icon: 'fa-cog' },
        { path: `${pathPrefix}/integrations/logs`, label: 'Protokolle', icon: 'fa-file-alt' }
      ]
    }
    
    // Standardmäßig leere Sidebar
    return []
  }
  
  const sidebarLinks = getSidebarLinks()
  const firstLink = sidebarLinks[0] || { label: 'Übersicht' }
  
  // Wenn keine Links für diesen Bereich vorhanden sind, zeige nichts an
  if (sidebarLinks.length === 0) {
    return null
  }

  return (
    <div className="px-4 pt-6 pb-2 w-full">
      {/* Seitenbereich mit mehr Abstand oben */}
      
      <nav className="space-y-1">
        {sidebarLinks.map((item, index) => {
          const isActive = pathname === item.path || 
                          (item.path.includes('?') && pathname === item.path.split('?')[0]);
          
          return (
            <div key={item.path || index} className="mb-1.5">
              <Link
                href={item.path}
                className={`flex items-center py-2.5 px-3 text-sm rounded-md transition-all duration-200 ${
                  isActive
                    ? 'font-medium text-[var(--primary-dark)] bg-gray-100/80 shadow-sm' 
                    : 'text-gray-600 hover:text-[var(--primary-dark)] hover:bg-gray-50'
                }`}
              >
                <div className={`flex-shrink-0 w-6 flex justify-center items-center ${
                  isActive ? 'text-[var(--accent)]' : 'text-gray-400'
                }`}>
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <span className="ml-2">{item.label}</span>
              </Link>
              
              {/* Nur ein feiner Trennstrich, keine volle Randlinie */}
              {index < sidebarLinks.length - 1 && (
                <div className="h-px bg-gray-100 my-1.5 mx-2"></div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  )
}
