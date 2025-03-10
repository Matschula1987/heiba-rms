'use client'

import React, { useState, useEffect } from 'react'
import { useExtendedMatchingStore } from '@/store/matchingStore.extension'
import { Button } from '@/components/ui/button'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function MatchingSettingsPage() {
  const { 
    matchingWeights, 
    updateMatchingWeights,
    includePortals,
    includeExternalJobs,
    setIncludePortals,
    setIncludeExternalJobs
  } = useExtendedMatchingStore()
  
  const [weights, setWeights] = useState({
    skills: matchingWeights.skills * 100 || 40,
    experience: matchingWeights.experience * 100 || 20,
    education: matchingWeights.education * 100 || 15,
    location: matchingWeights.location * 100 || 15,
    salary: matchingWeights.salary * 100 || 10
  })
  
  const [saved, setSaved] = useState(false)
  const [locationRadius, setLocationRadius] = useState(50)
  const [minimumScore, setMinimumScore] = useState(60)
  const [fuzzySkillMatching, setFuzzySkillMatching] = useState(true)
  
  useEffect(() => {
    // Reset saved notification after 3 seconds
    if (saved) {
      const timer = setTimeout(() => setSaved(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [saved])
  
  const handleSaveWeights = () => {
    // Convert to decimal form (0-1 range)
    updateMatchingWeights({
      skills: weights.skills / 100,
      experience: weights.experience / 100,
      education: weights.education / 100,
      location: weights.location / 100,
      salary: weights.salary / 100
    })
    setSaved(true)
  }
  
  const totalWeight = Object.values(weights).reduce((sum, val) => sum + val, 0)
  const isValidTotal = Math.abs(totalWeight - 100) < 0.01 // Account for floating point imprecision
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#002451]">Matching-Einstellungen</h1>
          <p className="text-gray-600">Konfigurieren Sie das Matching-System nach Ihren Bedürfnissen</p>
        </div>
      </div>
      
      {saved && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertDescription className="text-green-700">
            Einstellungen wurden erfolgreich gespeichert.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="weights" className="mb-6">
        <TabsList>
          <TabsTrigger value="weights">Gewichtungen</TabsTrigger>
          <TabsTrigger value="sources">Quellen</TabsTrigger>
          <TabsTrigger value="options">Optionen</TabsTrigger>
        </TabsList>
        
        <TabsContent value="weights">
          <Card>
            <CardHeader>
              <CardTitle>Gewichtungsfaktoren</CardTitle>
              <CardDescription>
                Legen Sie fest, wie stark die verschiedenen Faktoren beim Matching gewichtet werden sollen.
                Die Summe sollte 100% ergeben.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isValidTotal && (
                <Alert className="bg-yellow-50 border-yellow-200 mb-4">
                  <AlertDescription className="text-yellow-700">
                    Die Gesamtsumme der Gewichtungen sollte 100% ergeben. Aktuell: {totalWeight.toFixed(0)}%
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Fähigkeiten & Kenntnisse</Label>
                    <span className="text-sm font-medium">{weights.skills.toFixed(0)}%</span>
                  </div>
                  <Slider 
                    value={[weights.skills]} 
                    min={0} 
                    max={100} 
                    step={5}
                    onValueChange={(value) => setWeights({...weights, skills: value[0]})}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Übereinstimmung von geforderten und vorhandenen Fähigkeiten
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Berufserfahrung</Label>
                    <span className="text-sm font-medium">{weights.experience.toFixed(0)}%</span>
                  </div>
                  <Slider 
                    value={[weights.experience]} 
                    min={0} 
                    max={100} 
                    step={5}
                    onValueChange={(value) => setWeights({...weights, experience: value[0]})}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Übereinstimmung der geforderten Berufserfahrung
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Bildung & Ausbildung</Label>
                    <span className="text-sm font-medium">{weights.education.toFixed(0)}%</span>
                  </div>
                  <Slider 
                    value={[weights.education]} 
                    min={0} 
                    max={100} 
                    step={5}
                    onValueChange={(value) => setWeights({...weights, education: value[0]})}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Übereinstimmung des Bildungsniveaus und der Qualifikationen
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Standort</Label>
                    <span className="text-sm font-medium">{weights.location.toFixed(0)}%</span>
                  </div>
                  <Slider 
                    value={[weights.location]} 
                    min={0} 
                    max={100} 
                    step={5}
                    onValueChange={(value) => setWeights({...weights, location: value[0]})}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Nähe zum gewünschten Arbeitsort
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Gehaltsvorstellungen</Label>
                    <span className="text-sm font-medium">{weights.salary.toFixed(0)}%</span>
                  </div>
                  <Slider 
                    value={[weights.salary]} 
                    min={0} 
                    max={100} 
                    step={5}
                    onValueChange={(value) => setWeights({...weights, salary: value[0]})}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Übereinstimmung von Gehaltsvorstellungen und Budget
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSaveWeights} 
                disabled={!isValidTotal}
                className="w-full md:w-auto"
              >
                Gewichtungen speichern
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>Datenquellen</CardTitle>
              <CardDescription>
                Wählen Sie aus, welche Quellen für das Matching verwendet werden sollen.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-medium">Job-Portale einbeziehen</h3>
                  <p className="text-sm text-gray-500">
                    Stellenanzeigen von verbundenen Job-Portalen im Matching berücksichtigen
                  </p>
                </div>
                <Switch 
                  checked={includePortals} 
                  onCheckedChange={setIncludePortals}
                />
              </div>
              
              <div className="border-t border-gray-200"></div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-medium">Externe Stellenanzeigen</h3>
                  <p className="text-sm text-gray-500">
                    Stellenanzeigen aus externen Quellen und RSS-Feeds im Matching berücksichtigen
                  </p>
                </div>
                <Switch 
                  checked={includeExternalJobs} 
                  onCheckedChange={setIncludeExternalJobs}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="options">
          <Card>
            <CardHeader>
              <CardTitle>Erweiterte Optionen</CardTitle>
              <CardDescription>
                Passen Sie weitere Matching-Parameter an Ihre Bedürfnisse an.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Standort-Radius (km)</Label>
                  <span className="text-sm font-medium">{locationRadius} km</span>
                </div>
                <Slider 
                  value={[locationRadius]} 
                  min={10} 
                  max={200} 
                  step={10}
                  onValueChange={(value) => setLocationRadius(value[0])}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Maximale Entfernung vom gewünschten Arbeitsort
                </p>
              </div>
              
              <div className="border-t border-gray-200 my-4"></div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Mindest-Score (%)</Label>
                  <span className="text-sm font-medium">{minimumScore}%</span>
                </div>
                <Slider 
                  value={[minimumScore]} 
                  min={0} 
                  max={100} 
                  step={5}
                  onValueChange={(value) => setMinimumScore(value[0])}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Matches mit niedrigerem Score werden nicht angezeigt
                </p>
              </div>
              
              <div className="border-t border-gray-200 my-4"></div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-medium">Fuzzy-Skill-Matching</h3>
                  <p className="text-sm text-gray-500">
                    Ähnliche oder verwandte Skills als Übereinstimmung werten (z.B. "React" und "ReactJS")
                  </p>
                </div>
                <Switch 
                  checked={fuzzySkillMatching} 
                  onCheckedChange={setFuzzySkillMatching}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => {
                // In einer realen Anwendung würden wir diese Werte speichern
                setSaved(true)
              }}>
                Optionen speichern
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
