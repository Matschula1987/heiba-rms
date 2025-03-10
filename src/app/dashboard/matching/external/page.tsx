'use client'

import React, { useEffect, useState } from 'react'
import { useExtendedMatchingStore } from '@/store/matchingStore.extension'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import MatchDetailsModal from '@/components/modals/MatchDetailsModal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ExternalMatchingPage() {
  const { 
    externalMatches, 
    externalDailyMatches, 
    isLoading,
    runExternalMatching,
    getExternalMatchingStats,
    includePortals,
    includeExternalJobs,
    setIncludePortals,
    setIncludeExternalJobs
  } = useExtendedMatchingStore()
  
  const [stats, setStats] = useState({
    totalMatches: 0,
    highMatchCount: 0,
    averageScore: 0,
    matchesThisWeek: 0
  })
  const [showMatchDetails, setShowMatchDetails] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterScore, setFilterScore] = useState(0)
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const [portalFilter, setPortalFilter] = useState<string>('all')

  // Lade Matches beim Rendern der Seite
  useEffect(() => {
    runExternalMatching() // Initiales Matching
    
    // Lade Statistiken
    const fetchStats = async () => {
      const stats = await getExternalMatchingStats()
      setStats(stats)
    }
    
    fetchStats()
    
    const interval = setInterval(() => {
      runExternalMatching()
    }, 10 * 60 * 1000) // Aktualisiere alle 10 Minuten

    return () => clearInterval(interval)
  }, [runExternalMatching, getExternalMatchingStats])

  // Extrahiere alle einzigartigen Portale aus den Matches
  const uniquePortals = Array.from(new Set(
    externalMatches
      .map((match: any) => match.portalName || 'Unbekannt')
      .filter(Boolean)
  )) as string[]

  // Filtere die Matches
  const filteredMatches = externalMatches.filter((match: any) => {
    const matchesSearch = (
      (match.jobTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (match.candidateName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      ((match.companyName || match.customer || '').toLowerCase()).includes(searchTerm.toLowerCase())
    )
    const matchesScore = match.score >= filterScore
    const matchesPortal = portalFilter === 'all' || match.portalName === portalFilter
    return matchesSearch && matchesScore && matchesPortal
  })

  if (isLoading && externalMatches.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#002451]">Externes Matching</h1>
          <p className="text-gray-600">Matching mit externen Job-Portalen und Stellenanzeigen</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => runExternalMatching()}>
            <i className="fas fa-sync-alt mr-2"></i>
            Neu berechnen
          </Button>
          <Link href="/dashboard/matching/settings">
            <Button variant="outline">
              <i className="fas fa-cog mr-2"></i>
              Einstellungen
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Gesamt Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalMatches}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Matches &gt;90%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.highMatchCount}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Ø Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.averageScore}%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Portale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{uniquePortals.length}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Suche nach Job, Kandidat oder Unternehmen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Select
            value={filterScore.toString()}
            onValueChange={(value) => setFilterScore(Number(value))}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Min. Score" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Alle anzeigen</SelectItem>
              <SelectItem value="70">Min. 70%</SelectItem>
              <SelectItem value="80">Min. 80%</SelectItem>
              <SelectItem value="90">Min. 90%</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={portalFilter}
            onValueChange={setPortalFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Portal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Portale</SelectItem>
              {uniquePortals.map(portal => (
                <SelectItem key={portal} value={portal}>{portal}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex border rounded-md">
            <button
              className={`px-3 py-2 ${view === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setView('grid')}
            >
              <i className="fas fa-th-large"></i>
            </button>
            <button
              className={`px-3 py-2 ${view === 'table' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setView('table')}
            >
              <i className="fas fa-list"></i>
            </button>
          </div>
        </div>
        
        {/* Quellen-Filter */}
        <div className="mt-4 flex gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includePortals"
              checked={includePortals}
              onChange={() => setIncludePortals(!includePortals)}
              className="mr-2"
            />
            <label htmlFor="includePortals">Job-Portale einbeziehen</label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeExternalJobs"
              checked={includeExternalJobs}
              onChange={() => setIncludeExternalJobs(!includeExternalJobs)}
              className="mr-2"
            />
            <label htmlFor="includeExternalJobs">Externe Stellenanzeigen einbeziehen</label>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">Alle Matches</TabsTrigger>
          <TabsTrigger value="new">Neue Matches</TabsTrigger>
          <TabsTrigger value="high">Hohe Übereinstimmung</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredMatches.length > 0 ? (
                filteredMatches.map((match: any) => (
                  <div key={`${match.jobId}-${match.candidateId}`} 
                       onClick={() => setShowMatchDetails(`${match.jobId}-${match.candidateId}`)}
                       className="cursor-pointer">
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base">{match.jobTitle}</CardTitle>
                              {match.originalUrl && (
                                <a 
                                  href={match.originalUrl} 
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <i className="fas fa-external-link-alt text-xs"></i>
                                </a>
                              )}
                            </div>
                            <CardDescription>
                              <span className="bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-1">
                                {match.portalName || 'Extern'}
                              </span>
                              <span className="ml-2">{match.companyName}</span>
                            </CardDescription>
                          </div>
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-lg font-bold text-blue-800">{match.score}%</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="mb-3">
                          <p className="font-medium">{match.candidateName}</p>
                          <p className="text-sm text-gray-500">{match.candidatePosition}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {match.matchedSkills?.slice(0, 5).map((skill: string) => (
                            <Badge key={skill} variant="outline" className="bg-green-50">
                              {skill}
                            </Badge>
                          ))}
                          {(match.matchedSkills?.length || 0) > 5 && (
                            <Badge variant="outline" className="bg-gray-50">
                              +{match.matchedSkills.length - 5}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className={match.locationMatch ? 'text-green-600' : 'text-red-600'}>
                            <i className={`fas fa-map-marker-alt mr-1`}></i>
                            {match.locationMatch ? 'Standort ✓' : 'Standort ✗'}
                          </div>
                          <div className={match.salaryMatch ? 'text-green-600' : 'text-red-600'}>
                            <i className={`fas fa-euro-sign mr-1`}></i>
                            {match.salaryMatch ? 'Gehalt ✓' : 'Gehalt ✗'}
                          </div>
                          <div className={match.experienceMatch ? 'text-green-600' : 'text-red-600'}>
                            <i className={`fas fa-briefcase mr-1`}></i>
                            {match.experienceMatch ? 'Erfahrung ✓' : 'Erfahrung ✗'}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="w-full flex justify-between">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMatchDetails(`${match.jobId}-${match.candidateId}`);
                            }}
                          >
                            Details
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <i className="fas fa-paper-plane mr-1"></i>
                            {match.isPortalCandidate ? 'Bewerben' : 'Vorschlagen'}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </div>
                ))
              ) : (
                <div className="col-span-3 p-8 text-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Keine Matches gefunden.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg overflow-hidden shadow">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job / Portal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kandidat
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kriterien
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMatches.length > 0 ? (
                    filteredMatches.map((match: any) => (
                      <tr key={`${match.jobId}-${match.candidateId}`} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="cursor-pointer" onClick={() => setShowMatchDetails(`${match.jobId}-${match.candidateId}`)}>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-blue-600">{match.jobTitle}</p>
                              {match.originalUrl && (
                                <a 
                                  href={match.originalUrl} 
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <i className="fas fa-external-link-alt text-xs"></i>
                                </a>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-1">
                                {match.portalName || 'Extern'}
                              </span>
                              <span className="text-xs text-gray-500">{match.companyName}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{match.candidateName}</p>
                            <p className="text-xs text-gray-500">{match.candidatePosition}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {match.score}%
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center space-x-3 text-sm">
                            <span className={match.locationMatch ? 'text-green-600' : 'text-red-600'}>
                              <i className="fas fa-map-marker-alt"></i>
                            </span>
                            <span className={match.experienceMatch ? 'text-green-600' : 'text-red-600'}>
                              <i className="fas fa-briefcase"></i>
                            </span>
                            <span className={match.salaryMatch ? 'text-green-600' : 'text-red-600'}>
                              <i className="fas fa-euro-sign"></i>
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => setShowMatchDetails(`${match.jobId}-${match.candidateId}`)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button className="text-blue-600 hover:text-blue-800">
                              <i className="fas fa-paper-plane"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                        Keine Matches gefunden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="new">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {externalDailyMatches.length > 0 ? (
              externalDailyMatches
                .filter((match: any) => portalFilter === 'all' || match.portalName === portalFilter)
                .map((match: any) => (
                  <div key={`${match.jobId}-${match.candidateId}`} 
                       onClick={() => setShowMatchDetails(`${match.jobId}-${match.candidateId}`)}
                       className="cursor-pointer">
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base">{match.jobTitle}</CardTitle>
                              {match.originalUrl && (
                                <a 
                                  href={match.originalUrl} 
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <i className="fas fa-external-link-alt text-xs"></i>
                                </a>
                              )}
                            </div>
                            <CardDescription>
                              <span className="bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-1">
                                {match.portalName || 'Extern'}
                              </span>
                              <span className="ml-2">{match.companyName}</span>
                            </CardDescription>
                          </div>
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-lg font-bold text-blue-800">{match.score}%</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="mb-3">
                          <p className="font-medium">{match.candidateName}</p>
                          <p className="text-sm text-gray-500">{match.candidatePosition}</p>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="w-full flex justify-between">
                          <span className="text-xs text-gray-500">Heute</span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <i className="fas fa-paper-plane mr-1"></i>
                            {match.isPortalCandidate ? 'Bewerben' : 'Vorschlagen'}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </div>
                ))
            ) : (
              <div className="col-span-3 p-8 text-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Keine neuen Matches heute.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="high">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredMatches.filter((match: any) => match.score >= 90).length > 0 ? (
              filteredMatches
                .filter((match: any) => match.score >= 90)
                .map((match: any) => (
                  <div key={`${match.jobId}-${match.candidateId}`} 
                       onClick={() => setShowMatchDetails(`${match.jobId}-${match.candidateId}`)}
                       className="cursor-pointer">
                    <Card className="hover:shadow-md transition-shadow border-2 border-green-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base">{match.jobTitle}</CardTitle>
                              {match.originalUrl && (
                                <a 
                                  href={match.originalUrl} 
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <i className="fas fa-external-link-alt text-xs"></i>
                                </a>
                              )}
                            </div>
                            <CardDescription>
                              <span className="bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-1">
                                {match.portalName || 'Extern'}
                              </span>
                              <span className="ml-2">{match.companyName}</span>
                            </CardDescription>
                          </div>
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-lg font-bold text-green-800">{match.score}%</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="mb-3">
                          <p className="font-medium">{match.candidateName}</p>
                          <p className="text-sm text-gray-500">{match.candidatePosition}</p>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="w-full flex justify-between">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMatchDetails(`${match.jobId}-${match.candidateId}`);
                            }}
                          >
                            Details
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <i className="fas fa-paper-plane mr-1"></i>
                            {match.isPortalCandidate ? 'Bewerben' : 'Vorschlagen'}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </div>
                ))
            ) : (
              <div className="col-span-3 p-8 text-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Keine hochgradigen Matches gefunden.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Match-Details Modal */}
      <MatchDetailsModal
        matchId={showMatchDetails}
        isOpen={!!showMatchDetails}
        onClose={() => setShowMatchDetails(null)}
        matchType="external"
      />
    </div>
  )
}
