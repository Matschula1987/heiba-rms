'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  Briefcase, 
  FileText, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Percent
} from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <div className="p-2 bg-gray-100 rounded-md">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-heiba-blue">{value}</div>
        {(description || trend) && (
          <div className="flex items-center mt-1">
            {trend && (
              <span className={`flex items-center text-xs font-medium mr-2 ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(trend.value)}%
              </span>
            )}
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function DashboardStats() {
  // Diese Daten würden normalerweise aus einer API kommen
  const stats = [
    {
      title: "Aktive Kandidaten",
      value: 342,
      icon: <Users className="h-4 w-4 text-heiba-blue" />,
      trend: { value: 12, isPositive: true },
      description: "Im letzten Monat"
    },
    {
      title: "Offene Jobs",
      value: 27,
      icon: <Briefcase className="h-4 w-4 text-heiba-blue" />,
      trend: { value: 5, isPositive: true },
      description: "Im letzten Monat"
    },
    {
      title: "Neue Bewerbungen",
      value: 86,
      icon: <FileText className="h-4 w-4 text-heiba-blue" />,
      trend: { value: 3, isPositive: false },
      description: "Im letzten Monat"
    },
    {
      title: "Anstehende Termine",
      value: 14,
      icon: <Calendar className="h-4 w-4 text-heiba-blue" />,
      description: "In dieser Woche"
    },
    {
      title: "Erfolgsrate",
      value: "68%",
      icon: <Percent className="h-4 w-4 text-heiba-blue" />,
      trend: { value: 7, isPositive: true },
      description: "Im Vergleich zum Vormonat"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          trend={stat.trend}
          description={stat.description}
        />
      ))}
    </div>
  )
}
