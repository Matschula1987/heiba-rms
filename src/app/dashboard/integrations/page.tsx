'use client'

import { useState } from 'react'
import Link from 'next/link'

interface IntegrationCardProps {
  title: string;
  description: string;
  icon: string;
  status: 'active' | 'inactive' | 'error';
  link: string;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({ title, description, icon, status, link }) => {
  const statusIndicator = {
    active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Aktiv' },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inaktiv' },
    error: { bg: 'bg-red-100', text: 'text-red-800', label: 'Fehler' }
  }

  return (
    <Link href={link}>
      <div className="bg-white rounded-none shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-[var(--primary-dark)]/10 rounded-lg">
            <i className={`fas ${icon} text-[var(--accent)] text-xl`}></i>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusIndicator[status].bg} ${statusIndicator[status].text}`}>
            {statusIndicator[status].label}
          </span>
        </div>
        <h3 className="text-lg font-medium text-[var(--primary-dark)] mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </Link>
  )
}

export default function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const integrations = [
    {
      title: 'Monica AI',
      description: 'Automatische Lebenslaufanalyse und Datenextraktion mit KI',
      icon: 'fa-robot',
      status: 'active' as const,
      link: '/dashboard/integrations/monica-ai'
    },
    {
      title: 'Talent360',
      description: 'Integration mit dem Talent360 Bewerbermanagement-System für Kandidaten und Jobs',
      icon: 'fa-user-tie',
      status: 'active' as const,
      link: '/dashboard/integrations/talent360'
    },
    {
      title: 'Job-Portale',
      description: 'Stellenanzeigen auf verschiedenen Jobportalen verwalten und synchronisieren',
      icon: 'fa-briefcase',
      status: 'active' as const,
      link: '/dashboard/integrations/job-portals'
    },
    {
      title: 'E-Mail-Integration',
      description: 'Automatisierte E-Mail-Benachrichtigungen und Kampagnen für Kandidaten',
      icon: 'fa-envelope',
      status: 'active' as const,
      link: '/dashboard/integrations/email'
    },
    {
      title: 'Social Media',
      description: 'Integration mit LinkedIn, XING und anderen sozialen Netzwerken',
      icon: 'fa-share-alt',
      status: 'inactive' as const,
      link: '/dashboard/integrations/social'
    },
    {
      title: 'Kalender',
      description: 'Sync mit Google Calendar, Outlook und anderen Kalender-Diensten',
      icon: 'fa-calendar-alt',
      status: 'active' as const,
      link: '/dashboard/integrations/calendar'
    },
    {
      title: 'CRM-System',
      description: 'Integration mit CRM-Systemen wie Salesforce, HubSpot und anderen',
      icon: 'fa-users-cog',
      status: 'inactive' as const,
      link: '/dashboard/integrations/crm'
    },
    {
      title: 'Video-Interviews',
      description: 'Integration mit Zoom, Microsoft Teams und anderen Videokonferenz-Tools',
      icon: 'fa-video',
      status: 'error' as const,
      link: '/dashboard/integrations/video'
    }
  ]

  const filteredIntegrations = integrations.filter(integration => 
    integration.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    integration.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 mt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--primary-dark)]">Integrationen</h1>
            <p className="text-gray-600 mt-1">Verbinden Sie HeiBa mit anderen Diensten und Plattformen</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Integrationen durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--primary-dark)]/20 w-64"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
            <button className="bg-[var(--primary-dark)] text-white px-4 py-2 rounded-none hover:bg-[var(--primary-light)] transition-colors">
              <i className="fas fa-plus mr-2 text-[var(--accent)]"></i>
              Neue Integration
            </button>
          </div>
        </div>

        {/* Integrationen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredIntegrations.map((integration, index) => (
            <IntegrationCard
              key={index}
              title={integration.title}
              description={integration.description}
              icon={integration.icon}
              status={integration.status}
              link={integration.link}
            />
          ))}
        </div>

        {/* API-Bereich */}
        <div className="bg-white rounded-none shadow-md p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-[var(--primary-dark)]">API-Zugriff</h2>
              <p className="text-gray-600 mt-1">Zugriff auf die HeiBa Recruitment API</p>
            </div>
            <button className="text-[var(--primary-dark)] hover:text-[var(--primary-light)] px-3 py-1 border border-[var(--primary-dark)] rounded-none transition-colors">
              API-Dokumentation
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium">API-Schlüssel</p>
              <button className="text-xs text-[var(--primary-dark)] hover:underline">Neu generieren</button>
            </div>
            <div className="flex">
              <input
                type="password"
                value="••••••••••••••••••••••••••••••"
                readOnly
                className="bg-white border rounded-l-md px-3 py-2 flex-grow"
              />
              <button className="bg-gray-200 hover:bg-gray-300 px-3 rounded-r-md border-y border-r transition-colors">
                <i className="far fa-copy"></i>
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p className="mb-2"><i className="fas fa-info-circle mr-2 text-[var(--accent)]"></i> Die API ermöglicht programmatischen Zugriff auf HeiBa Recruitment Daten und Funktionen.</p>
            <p><i className="fas fa-shield-alt mr-2 text-[var(--accent)]"></i> Behandeln Sie Ihren API-Schlüssel vertraulich, um unbefugten Zugriff zu verhindern.</p>
          </div>
        </div>

        {/* Webhook-Bereich */}
        <div className="bg-white rounded-none shadow-md p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-[var(--primary-dark)]">Webhooks</h2>
              <p className="text-gray-600 mt-1">Erhalten Sie Echtzeit-Updates bei Ereignissen</p>
            </div>
            <button className="bg-[var(--primary-dark)] text-white px-3 py-1 rounded-none hover:bg-[var(--primary-light)] transition-colors">
              <i className="fas fa-plus mr-1 text-[var(--accent)]"></i> Webhook hinzufügen
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ereignisse</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">https://example.com/webhook/candidate</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">Kandidaten-Updates</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Aktiv
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-[var(--primary-dark)] hover:text-[var(--primary-light)] mr-3">Bearbeiten</button>
                    <button className="text-red-600 hover:text-red-800">Löschen</button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">https://example.com/webhook/jobs</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">Job-Updates</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Aktiv
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-[var(--primary-dark)] hover:text-[var(--primary-light)] mr-3">Bearbeiten</button>
                    <button className="text-red-600 hover:text-red-800">Löschen</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
