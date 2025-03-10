// src/components/candidates/CandidateHeader.tsx
import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Candidate } from '@/types'

interface CandidateHeaderProps {
  candidate: Candidate
}

export function CandidateHeader({ candidate }: CandidateHeaderProps) {
  // Extrahiere die Initialen aus dem Namen für den Avatar-Fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Bestimme die Farbe des Status-Badges
  const getStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-500";
    
    switch (status.toLowerCase()) {
      case 'neu':
        return "bg-blue-500";
      case 'im gespräch':
        return "bg-amber-500";
      case 'angebot':
        return "bg-purple-500";
      case 'eingestellt':
        return "bg-green-500";
      case 'abgelehnt':
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <Avatar className="h-20 w-20 border-2 border-primary">
            {candidate.profilePicture ? (
              <AvatarImage src={candidate.profilePicture} alt={candidate.name} />
            ) : (
              <AvatarFallback className="text-lg">{getInitials(candidate.name)}</AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold">{candidate.name}</h2>
                <p className="text-gray-500">{candidate.title || "Keine Position angegeben"}</p>
              </div>
              
              {candidate.status && (
                <Badge 
                  className={`${getStatusColor(candidate.status)} text-white`}
                >
                  {candidate.status}
                </Badge>
              )}
            </div>
            
            <div className="mt-3 flex flex-wrap gap-2">
              {candidate.skills && candidate.skills.map((skill, index) => (
                <Badge key={index} variant="outline">{skill}</Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
