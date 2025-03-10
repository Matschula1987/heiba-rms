'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Candidate } from '@/types'
import { Button } from "@/components/ui/button"
import { GoldButton } from "@/components/ui/gold-button"
import CandidateList from '@/components/candidates/CandidateList'
import { Plus } from 'lucide-react'
import { useCandidateStore } from '@/store/candidateStore'

export default function CandidatesPage() {
  const router = useRouter()
  const { candidates, fetchCandidates, isLoading } = useCandidateStore()
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  // Sicherer Filter mit Typ-Check und Fallback
  const filteredCandidates = Array.isArray(candidates) 
    ? candidates.filter((candidate: Candidate) => 
        (statusFilter === 'all' || candidate.status === statusFilter) &&
        (searchTerm === '' || 
          candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.location.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : [];

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="text-heiba-blue">Loading...</div>
    </div>
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#002451]">Kandidaten</h1>
        <GoldButton
          onClick={() => router.push('/dashboard/candidates/new')}
        >
          <Plus className="mr-2" />
          Neuer Kandidat
        </GoldButton>
      </div>

      {/* Filter und Suche */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002451]"
          >
            <option value="all">Alle Status</option>
            <option value="new">Neu</option>
            <option value="in_process">In Bearbeitung</option>
            <option value="hired">Eingestellt</option>
            <option value="rejected">Abgelehnt</option>
            <option value="inactive">Inaktiv</option>
          </select>
          
          <input
            type="text"
            placeholder="Suche nach Namen, Position oder Standort..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002451]"
          />
        </div>
      </div>

      {/* Kandidatenliste */}
      <CandidateList
        candidates={filteredCandidates}
        onCandidateClick={(candidate: Candidate) => router.push(`/dashboard/candidates/${candidate.id}`)}
      />
    </div>
  )
}
