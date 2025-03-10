'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

interface Activity {
  id: string
  type: 'application' | 'interview' | 'offer' | 'hire' | 'message' | 'note'
  title: string
  description: string
  timestamp: Date
  user?: {
    name: string
    avatar?: string
    initials: string
  }
  relatedTo?: {
    type: 'candidate' | 'job' | 'company'
    name: string
    id: string
  }
}

const activityTypeConfig = {
  application: {
    label: 'Bewerbung',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  interview: {
    label: 'Interview',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  offer: {
    label: 'Angebot',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  hire: {
    label: 'Einstellung',
    color: 'bg-heiba-gold/20 text-amber-800 border-heiba-gold/30'
  },
  message: {
    label: 'Nachricht',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  note: {
    label: 'Notiz',
    color: 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function RecentActivities() {
  // Beispieldaten - würden normalerweise aus einer API kommen
  const activities: Activity[] = [
    {
      id: '1',
      type: 'application',
      title: 'Neue Bewerbung eingegangen',
      description: 'Max Mustermann hat sich auf die Stelle "Senior Developer" beworben.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 Minuten zuvor
      relatedTo: {
        type: 'candidate',
        name: 'Max Mustermann',
        id: 'cand-123'
      }
    },
    {
      id: '2',
      type: 'interview',
      title: 'Interview geplant',
      description: 'Interview mit Anna Schmidt für die Position "Marketing Manager" am 15.03.2025.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 Stunden zuvor
      user: {
        name: 'Thomas Weber',
        initials: 'TW'
      },
      relatedTo: {
        type: 'candidate',
        name: 'Anna Schmidt',
        id: 'cand-456'
      }
    },
    {
      id: '3',
      type: 'offer',
      title: 'Angebot erstellt',
      description: 'Angebot für Julia Meyer für die Position "UX Designer" wurde erstellt.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 Stunden zuvor
      user: {
        name: 'Sarah König',
        initials: 'SK'
      },
      relatedTo: {
        type: 'candidate',
        name: 'Julia Meyer',
        id: 'cand-789'
      }
    },
    {
      id: '4',
      type: 'note',
      title: 'Notiz hinzugefügt',
      description: 'Feedback zum technischen Interview mit Peter Bauer wurde hinzugefügt.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 Tag zuvor
      user: {
        name: 'Michael Schneider',
        initials: 'MS'
      },
      relatedTo: {
        type: 'candidate',
        name: 'Peter Bauer',
        id: 'cand-101'
      }
    },
    {
      id: '5',
      type: 'hire',
      title: 'Kandidat eingestellt',
      description: 'Lukas Fischer wurde für die Position "Backend Developer" eingestellt.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 Tage zuvor
      user: {
        name: 'Sarah König',
        initials: 'SK'
      },
      relatedTo: {
        type: 'candidate',
        name: 'Lukas Fischer',
        id: 'cand-202'
      }
    }
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Letzte Aktivitäten</CardTitle>
        <Button variant="outline" size="sm">Alle anzeigen</Button>
      </CardHeader>
      <CardContent className="space-y-5">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4">
            {activity.user ? (
              <Avatar className="h-9 w-9">
                {activity.user.avatar ? (
                  <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                ) : null}
                <AvatarFallback>{activity.user.initials}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-500 text-xs">
                  {activity.type === 'application' ? 'AB' : 'SYS'}
                </span>
              </div>
            )}
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{activity.title}</p>
                <Badge variant="outline" className={activityTypeConfig[activity.type].color}>
                  {activityTypeConfig[activity.type].label}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">{activity.description}</p>
              <div className="flex items-center text-xs text-gray-500">
                <span>
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: de })}
                </span>
                {activity.relatedTo && (
                  <>
                    <span className="mx-1">•</span>
                    <span>
                      {activity.relatedTo.type === 'candidate' ? 'Kandidat: ' : 
                       activity.relatedTo.type === 'job' ? 'Stelle: ' : 'Unternehmen: '}
                      {activity.relatedTo.name}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
