// src/components/candidates/CandidateWorkExperience.tsx
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WorkExperience } from '@/types'

interface CandidateWorkExperienceProps {
  experiences: WorkExperience[];
}

export function CandidateWorkExperience({ experiences }: CandidateWorkExperienceProps) {
  // Formatiert das Datum im deutschen Format (MM.YYYY)
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  // Berechnet die Dauer zwischen zwei Daten in Jahren und Monaten
  const calculateDuration = (startDate: string, endDate?: string): string => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const years = end.getFullYear() - start.getFullYear();
    const months = end.getMonth() - start.getMonth();
    
    let totalMonths = years * 12 + months;
    if (totalMonths < 0) totalMonths = 0;
    
    const durationYears = Math.floor(totalMonths / 12);
    const durationMonths = totalMonths % 12;
    
    let result = '';
    if (durationYears > 0) {
      result += `${durationYears} Jahr${durationYears !== 1 ? 'e' : ''}`;
    }
    if (durationMonths > 0 || durationYears === 0) {
      if (durationYears > 0) result += ' ';
      result += `${durationMonths} Monat${durationMonths !== 1 ? 'e' : ''}`;
    }
    
    return result;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Berufserfahrung</CardTitle>
      </CardHeader>
      <CardContent>
        {experiences && experiences.length > 0 ? (
          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <div key={index} className="border-l-2 border-primary pl-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                  <h3 className="font-semibold text-lg">{exp.title}</h3>
                  <span className="text-sm text-gray-500">
                    {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Aktuell'}
                    <span className="ml-2">({calculateDuration(exp.startDate, exp.endDate)})</span>
                  </span>
                </div>
                <p className="font-medium text-gray-700 mb-2">{exp.company}</p>
                {exp.description && (
                  <p className="text-gray-600 whitespace-pre-line">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Keine Berufserfahrung angegeben</p>
        )}
      </CardContent>
    </Card>
  )
}
