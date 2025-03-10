﻿"use client"

import { Card } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Eye, FileEdit, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Candidate } from '@/types'
import CandidateCard from '../cards/CandidateCard'

// Beispieldaten für Fallback
const initialCandidates: Candidate[] = [
  { 
    id: '1', 
    name: 'Max Mustermann', 
    email: 'max.mustermann@example.com',
    position: 'Full-Stack Entwickler', 
    location: 'München', 
    status: 'active',
    createdAt: '2025-02-28'
  },
  { 
    id: '2', 
    name: 'Anna Schmidt', 
    email: 'anna.schmidt@example.com',
    position: 'UX Designer', 
    location: 'Berlin', 
    status: 'in_process',
    createdAt: '2025-02-25'
  },
  { 
    id: '3', 
    name: 'Thomas Weber', 
    email: 'thomas.weber@example.com',
    position: 'DevOps Engineer', 
    location: 'Hamburg', 
    status: 'new',
    createdAt: '2025-03-01'
  }
]

interface CandidateListProps {
  candidates?: Candidate[];
  onCandidateClick?: (candidate: Candidate) => void;
}

export default function CandidateList({ 
  candidates = initialCandidates,
  onCandidateClick = (candidate) => console.log(`Candidate with ID ${candidate.id} selected`)
}: CandidateListProps) {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'in_process':
        return 'bg-blue-100 text-blue-800'
      case 'new':
        return 'bg-purple-100 text-purple-800'
      case 'hired':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {candidates.map((candidate) => (
        <CandidateCard 
          key={candidate.id} 
          candidate={candidate} 
          onClick={() => onCandidateClick(candidate)}
        />
      ))}
    </div>
  )
}
