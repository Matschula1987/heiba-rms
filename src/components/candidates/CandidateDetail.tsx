// src/components/candidates/CandidateDetails.tsx
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Candidate } from '@/types'

interface CandidateDetailsProps {
  candidate: Candidate;
}

export function CandidateDetails({ candidate }: CandidateDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Persönliche Informationen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p>{candidate.name}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">E-Mail</h3>
              <p>{candidate.email}</p>
            </div>
            
            {candidate.phone && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Telefon</h3>
                <p>{candidate.phone}</p>
              </div>
            )}
            
            {candidate.address && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Adresse</h3>
                <p>{candidate.address}</p>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {candidate.title && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Position</h3>
                <p>{candidate.title}</p>
              </div>
            )}
            
            {candidate.availability && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Verfügbarkeit</h3>
                <p>{candidate.availability}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Erstellt am</h3>
              <p>{new Date(candidate.createdAt).toLocaleDateString('de-DE')}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Aktualisiert am</h3>
              <p>{new Date(candidate.updatedAt).toLocaleDateString('de-DE')}</p>
            </div>
          </div>
        </div>
        
        {candidate.description && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Beschreibung</h3>
            <p className="whitespace-pre-line">{candidate.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
