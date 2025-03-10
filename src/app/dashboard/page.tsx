'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, Briefcase, FileText, ArrowRight, Calendar, CheckSquare, Bell, Star } from 'lucide-react'
import StatCard from '@/components/cards/StatCard'
import ModuleCard from '@/components/cards/ModuleCard'
import { useDashboardStore } from '@/store/dashboardStore'
import { useJobStore } from '@/store/jobStore'
import { GoldButton } from '@/components/ui/gold-button'

export default function DashboardPage() {
  const router = useRouter()
  const { stats, fetchStats, isLoading: statsLoading } = useDashboardStore()
  const { jobs, fetchJobs, isLoading: jobsLoading } = useJobStore()
  
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      setAuthLoading(true)
      try {
        const res = await fetch('/api/auth/verify')
        const data = await res.json()
        
        if (!data.authenticated) {
          router.push('/login')
          return
        }
        
        setIsAuthenticated(true)
        setUser(data.user)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/login')
      } finally {
        setAuthLoading(false)
      }
    }
    
    verifyAuth()
  }, [router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats()
      fetchJobs()
    }
  }, [isAuthenticated, fetchStats, fetchJobs])

  if (authLoading || statsLoading || jobsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-dark)]"></div>
      </div>
    )
  }

  // Beispiel-Daten für die Schnellzugriff-Widgets
  const upcomingTasks = [
    { id: 1, title: "Bewerbungsgespräch vorbereiten", date: "10.03.2025", priority: "high" },
    { id: 2, title: "Stellenanzeige für Frontend-Entwickler überarbeiten", date: "12.03.2025", priority: "medium" },
    { id: 3, title: "Matching-Algorithmus anpassen", date: "15.03.2025", priority: "low" }
  ];

  const recentCandidates = [
    { id: 101, name: "Maria Schmidt", position: "Frontend-Entwickler", date: "08.03.2025" },
    { id: 102, name: "Thomas Müller", position: "DevOps Engineer", date: "07.03.2025" },
    { id: 103, name: "Sabine Weber", position: "UX Designer", date: "06.03.2025" }
  ];

  const recentActivities = [
    { id: 201, text: "Neue Bewerbung für Stelle #4532", time: "Heute, 14:30" },
    { id: 202, text: "5 neue Matches für Talent-Pool", time: "Heute, 11:15" },
    { id: 203, text: "Stellenanzeige #127 läuft morgen ab", time: "Gestern, 16:45" },
    { id: 204, text: "Benachrichtigung: Meeting mit HR", time: "Gestern, 10:00" }
  ];

  return (
    <>
      {/* Statistik-Karten */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Offene Bewerbungen" 
          value={stats?.openApplications ?? 0}
          icon="file-alt"
        />
        <StatCard 
          title="Daily Fits" 
          value={stats?.dailyFits ?? 0}
          icon="check-circle"
        />
        <StatCard 
          title="Aktive Stellen" 
          value={stats?.activeJobs ?? 0}
          icon="briefcase"
        />
        <StatCard 
          title="Portal-Einträge" 
          value={stats?.portalEntries ?? 0}
          icon="globe"
        />
      </div>

      {/* Hauptmodule */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ModuleCard
          title="Matching"
          subtitle="Kandidaten & Stellen abgleichen"
          icon="users"
          matchRate={stats?.matchRate ?? 0}
          stats={[
            { label: "Neue Matches heute", value: "5" }
          ]}
          onClick={() => router.push('/dashboard/matching')}
        />
        <ModuleCard
          title="Jobs"
          subtitle="Alle aktiven Ausschreibungen"
          icon="briefcase"
          stats={[
            { label: "Aktive Anzeigen", value: (stats?.activeJobs ?? 0).toString() },
            { label: "Neue Bewerbungen", value: "7" }
          ]}
          onClick={() => router.push('/dashboard/jobs')}
        />
        <ModuleCard
          title="Talent-Pool"
          subtitle="Kandidaten verwalten"
          icon="user-tie"
          stats={[
            { label: "Gesamt", value: "248" },
            { label: "Neue heute", value: "3" }
          ]}
          onClick={() => router.push('/dashboard/talent-pool')}
        />
      </div>

      {/* Schnellzugriff und Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Anstehende Aufgaben */}
        <div className="bg-white rounded-none shadow-md overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-[var(--primary-dark)]">
            <div className="flex items-center">
              <CheckSquare className="text-[var(--accent)] mr-2" size={20} />
              <h2 className="text-lg font-semibold text-white">Anstehende Aufgaben</h2>
            </div>
            <button 
              onClick={() => router.push('/dashboard/tasks')}
              className="text-white hover:text-[var(--accent)] transition-colors text-sm"
            >
              Alle anzeigen
            </button>
          </div>
          <div className="divide-y">
            {upcomingTasks.map(task => (
              <div key={task.id} className="p-3 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-[var(--primary-dark)]">{task.title}</h3>
                    <p className="text-sm text-gray-500">Fällig: {task.date}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-none ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority === 'high' ? 'Hoch' : task.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kürzlich bearbeitete Kandidaten */}
        <div className="bg-white rounded-none shadow-md overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-[var(--primary-dark)]">
            <div className="flex items-center">
              <Users className="text-[var(--accent)] mr-2" size={20} />
              <h2 className="text-lg font-semibold text-white">Zuletzt bearbeitet</h2>
            </div>
            <button 
              onClick={() => router.push('/dashboard/talent-pool')}
              className="text-white hover:text-[var(--accent)] transition-colors text-sm"
            >
              Alle anzeigen
            </button>
          </div>
          <div className="divide-y">
            {recentCandidates.map(candidate => (
              <div key={candidate.id} className="p-3 hover:bg-gray-50 cursor-pointer"
                   onClick={() => router.push(`/dashboard/talent-pool/${candidate.id}`)}>
                <h3 className="font-medium text-[var(--primary-dark)]">{candidate.name}</h3>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-500">{candidate.position}</p>
                  <p className="text-xs text-gray-400">{candidate.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aktivitäten */}
        <div className="bg-white rounded-none shadow-md overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-[var(--primary-dark)]">
            <div className="flex items-center">
              <Bell className="text-[var(--accent)] mr-2" size={20} />
              <h2 className="text-lg font-semibold text-white">Aktivitäten</h2>
            </div>
            <button 
              onClick={() => router.push('/dashboard/notifications')}
              className="text-white hover:text-[var(--accent)] transition-colors text-sm"
            >
              Alle anzeigen
            </button>
          </div>
          <div className="divide-y">
            {recentActivities.map(activity => (
              <div key={activity.id} className="p-3 hover:bg-gray-50">
                <p className="text-[var(--primary-dark)]">{activity.text}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schnellzugriff-Buttons */}
      <div className="flex flex-wrap gap-4 mt-8">
        <GoldButton onClick={() => router.push('/dashboard/applications/new')}>
          <FileText className="mr-2" size={18} />
          Neue Bewerbung
        </GoldButton>
        <GoldButton onClick={() => router.push('/dashboard/jobs/new')}>
          <Briefcase className="mr-2" size={18} />
          Neue Stellenanzeige
        </GoldButton>
        <GoldButton onClick={() => router.push('/dashboard/talent-pool/new')}>
          <Users className="mr-2" size={18} />
          Neuer Kandidat
        </GoldButton>
      </div>
    </>
  )
}
