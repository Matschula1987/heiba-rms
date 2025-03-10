'use client'

import React from 'react'
import { useExtendedMatchingStore } from '@/store/matchingStore.extension'
import { Button } from '@/components/ui/button'
import { GoldButton } from '@/components/ui/gold-button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function MatchingDashboardPage() {
  const { 
    internalMatches, 
    externalMatches, 
    isLoading,
    runGlobalMatching
  } = useExtendedMatchingStore()
  
  const internalHighMatches = (internalMatches as any[]).filter(m => m.score >= 90).length
  const externalHighMatches = (externalMatches as any[]).filter(m => m.score >= 90).length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#002451]">Matching-Dashboard</h1>
          <p className="text-gray-600 mt-1">Geeignete Kandidaten für Stellen und passende Stellen für Kandidaten finden</p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={runGlobalMatching}
          className="flex items-center gap-2"
        >
          <i className="fas fa-sync-alt"></i>
          Alle Matches aktualisieren
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Internes Matching */}
        <Card className="hover:shadow-lg transition-shadow rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-[var(--accent)]">Internes Matching</CardTitle>
            <CardDescription>
              Matching zwischen internen Kandidaten und Positionen
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4">
                <p className="text-gray-500 text-sm">Gesamt</p>
                <p className="text-3xl font-bold">{internalMatches.length}</p>
              </div>
              
              <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4">
                <p className="text-gray-500 text-sm">Hohe Matches</p>
                <p className="text-3xl font-bold text-green-600">{internalHighMatches}</p>
              </div>
              
              <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4">
                <p className="text-gray-500 text-sm">Score Ø</p>
                <p className="text-3xl font-bold">
                  {internalMatches.length > 0 
                    ? Math.round((internalMatches as any[]).reduce((sum, m) => sum + m.score, 0) / internalMatches.length) 
                    : 0}%
                </p>
              </div>
            </div>
            
            <div className="text-gray-600">
              <p>Das interne Matching hilft Ihnen dabei, passende Kandidaten für offene Stellen in Ihrem Unternehmen zu finden. Es berücksichtigt dabei Fähigkeiten, Erfahrungen, Standorte und andere wichtige Faktoren, um die besten Übereinstimmungen zu ermitteln.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/matching/internal" className="w-full">
              <GoldButton className="w-full">
                Zu internem Matching
              </GoldButton>
            </Link>
          </CardFooter>
        </Card>
        
        {/* Externes Matching */}
        <Card className="hover:shadow-lg transition-shadow rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-[var(--primary-dark)]">Externes Matching</CardTitle>
            <CardDescription>
              Matching mit externen Job-Portalen und Stellenanzeigen
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4">
                <p className="text-gray-500 text-sm">Gesamt</p>
                <p className="text-3xl font-bold">{externalMatches.length}</p>
              </div>
              
              <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4">
                <p className="text-gray-500 text-sm">Hohe Matches</p>
                <p className="text-3xl font-bold text-green-600">{externalHighMatches}</p>
              </div>
              
              <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4">
                <p className="text-gray-500 text-sm">Score Ø</p>
                <p className="text-3xl font-bold">
                  {externalMatches.length > 0 
                    ? Math.round((externalMatches as any[]).reduce((sum, m) => sum + m.score, 0) / externalMatches.length) 
                    : 0}%
                </p>
              </div>
            </div>
            
            <div className="text-gray-600">
              <p>Das externe Matching verbindet Ihre Kandidaten mit externen Stellenangeboten von verschiedenen Job-Portalen. Es hilft Ihnen dabei, passende Stellen für Ihre Kandidaten zu finden und erweitert damit Ihre Vermittlungsmöglichkeiten.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/matching/external" className="w-full">
              <Button className="w-full bg-[var(--primary-dark)] hover:bg-[var(--primary-light)]">
                Zu externem Matching
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-none border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Wie funktioniert das Matching-System?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-none shadow-sm">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mb-3">
              <i className="fas fa-sync-alt"></i>
            </div>
            <h3 className="font-medium mb-2">Automatisches Matching</h3>
            <p className="text-gray-600 text-sm">
              Das System vergleicht automatisch die Profile von Kandidaten mit Stellenanzeigen und berechnet einen Match-Score basierend auf verschiedenen Faktoren.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-none shadow-sm">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mb-3">
              <i className="fas fa-filter"></i>
            </div>
            <h3 className="font-medium mb-2">Intelligente Filter</h3>
            <p className="text-gray-600 text-sm">
              Nutzen Sie verschiedene Filter wie Skillsets, Standorte oder Gehaltsbereiche, um die passendsten Matches für Ihre Bedürfnisse zu finden.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-none shadow-sm">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mb-3">
              <i className="fas fa-paper-plane"></i>
            </div>
            <h3 className="font-medium mb-2">Einfache Kommunikation</h3>
            <p className="text-gray-600 text-sm">
              Kontaktieren Sie Kandidaten oder bewerben Sie sich auf externe Stellen direkt aus dem System heraus, um den Vermittlungsprozess zu beschleunigen.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-10">
        <Link href="/dashboard/matching/settings">
          <Button variant="outline" className="flex items-center gap-2">
            <i className="fas fa-cog"></i>
            Matching-Einstellungen anpassen
          </Button>
        </Link>
      </div>
    </div>
  )
}
