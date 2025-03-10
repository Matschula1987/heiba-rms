'use client'

import React from 'react'
import { useFilterStore } from '@/store/filterStore'
import { CandidateFilter, CANDIDATE_STATUS_OPTIONS } from '@/types/filters'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

interface CandidateFilterInputsProps {
  onClose: () => void;
}

/**
 * Panel mit Filteroptionen speziell für Kandidaten
 * Wird in der FilterBar-Komponente verwendet
 */
export function CandidateFilterInputs({ onClose }: CandidateFilterInputsProps) {
  const { currentCandidateFilter, updateCandidateFilter } = useFilterStore()
  
  const [localFilter, setLocalFilter] = React.useState<Partial<CandidateFilter>>({
    status: currentCandidateFilter.status || [],
    locations: currentCandidateFilter.locations ? [...currentCandidateFilter.locations] : [],
    skills: currentCandidateFilter.skills ? [...currentCandidateFilter.skills] : [],
    experienceMin: currentCandidateFilter.experienceMin,
    experienceMax: currentCandidateFilter.experienceMax,
    languages: currentCandidateFilter.languages ? [...currentCandidateFilter.languages] : [],
    sources: currentCandidateFilter.sources ? [...currentCandidateFilter.sources] : []
  })
  
  // Status-Filter Toggle
  const toggleStatus = (status: string) => {
    setLocalFilter(prev => {
      const currentStatuses = prev.status || []
      const newStatuses = currentStatuses.includes(status)
        ? currentStatuses.filter(s => s !== status)
        : [...currentStatuses, status]
      
      return {
        ...prev,
        status: newStatuses
      }
    })
  }
  
  // Location hinzufügen
  const addLocation = (location: string) => {
    if (!location.trim()) return
    
    setLocalFilter(prev => ({
      ...prev,
      locations: [...(prev.locations || []), location.trim()]
    }))
    
    // Input-Feld leeren
    const locationInput = document.getElementById('location-input') as HTMLInputElement
    if (locationInput) locationInput.value = ''
  }
  
  // Location entfernen
  const removeLocation = (location: string) => {
    setLocalFilter(prev => ({
      ...prev,
      locations: (prev.locations || []).filter(l => l !== location)
    }))
  }
  
  // Skill hinzufügen
  const addSkill = (skill: string) => {
    if (!skill.trim()) return
    
    setLocalFilter(prev => ({
      ...prev,
      skills: [...(prev.skills || []), skill.trim()]
    }))
    
    // Input-Feld leeren
    const skillInput = document.getElementById('skill-input') as HTMLInputElement
    if (skillInput) skillInput.value = ''
  }
  
  // Skill entfernen
  const removeSkill = (skill: string) => {
    setLocalFilter(prev => ({
      ...prev,
      skills: (prev.skills || []).filter(s => s !== skill)
    }))
  }
  
  // Sprache hinzufügen
  const addLanguage = (language: string) => {
    if (!language.trim()) return
    
    setLocalFilter(prev => ({
      ...prev,
      languages: [...(prev.languages || []), language.trim()]
    }))
    
    // Input-Feld leeren
    const languageInput = document.getElementById('language-input') as HTMLInputElement
    if (languageInput) languageInput.value = ''
  }
  
  // Sprache entfernen
  const removeLanguage = (language: string) => {
    setLocalFilter(prev => ({
      ...prev,
      languages: (prev.languages || []).filter(l => l !== language)
    }))
  }
  
  // Filter anwenden
  const applyFilters = () => {
    updateCandidateFilter(localFilter)
    onClose()
  }
  
  return (
    <div className="space-y-4">
      {/* Status-Filter */}
      <div>
        <h4 className="text-sm font-medium mb-2">Status</h4>
        <div className="grid grid-cols-2 gap-2">
          {CANDIDATE_STATUS_OPTIONS.map(status => (
            <div key={status.value} className="flex items-center gap-2">
              <Checkbox
                id={`status-${status.value}`}
                checked={(localFilter.status || []).includes(status.value)}
                onCheckedChange={() => toggleStatus(status.value)}
              />
              <Label htmlFor={`status-${status.value}`} className="text-sm cursor-pointer">
                {status.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Standorte-Filter */}
      <div>
        <h4 className="text-sm font-medium mb-2">Standort</h4>
        <div className="flex gap-2 mb-2">
          <Input
            id="location-input"
            placeholder="Standort hinzufügen"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addLocation((e.target as HTMLInputElement).value)
                e.preventDefault()
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const input = document.getElementById('location-input') as HTMLInputElement
              addLocation(input.value)
            }}
          >
            +
          </Button>
        </div>
        
        {/* Liste der ausgewählten Standorte */}
        {(localFilter.locations || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {(localFilter.locations || []).map(location => (
              <div 
                key={location} 
                className="bg-gray-100 px-2 py-1 rounded text-xs flex items-center gap-1"
              >
                {location}
                <button
                  type="button"
                  onClick={() => removeLocation(location)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Skills-Filter */}
      <div>
        <h4 className="text-sm font-medium mb-2">Skills</h4>
        <div className="flex gap-2 mb-2">
          <Input
            id="skill-input"
            placeholder="Skill hinzufügen"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addSkill((e.target as HTMLInputElement).value)
                e.preventDefault()
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const input = document.getElementById('skill-input') as HTMLInputElement
              addSkill(input.value)
            }}
          >
            +
          </Button>
        </div>
        
        {/* Liste der ausgewählten Skills */}
        {(localFilter.skills || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {(localFilter.skills || []).map(skill => (
              <div 
                key={skill} 
                className="bg-gray-100 px-2 py-1 rounded text-xs flex items-center gap-1"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Berufserfahrung-Filter */}
      <div>
        <h4 className="text-sm font-medium mb-2">Berufserfahrung (Jahre)</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Mindestens</label>
            <Input
              type="number"
              placeholder="Min"
              value={localFilter.experienceMin || ''}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) : undefined
                setLocalFilter(prev => ({ ...prev, experienceMin: value }))
              }}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Höchstens</label>
            <Input
              type="number"
              placeholder="Max"
              value={localFilter.experienceMax || ''}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) : undefined
                setLocalFilter(prev => ({ ...prev, experienceMax: value }))
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Sprachen-Filter */}
      <div>
        <h4 className="text-sm font-medium mb-2">Sprachen</h4>
        <div className="flex gap-2 mb-2">
          <Input
            id="language-input"
            placeholder="Sprache hinzufügen"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addLanguage((e.target as HTMLInputElement).value)
                e.preventDefault()
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const input = document.getElementById('language-input') as HTMLInputElement
              addLanguage(input.value)
            }}
          >
            +
          </Button>
        </div>
        
        {/* Liste der ausgewählten Sprachen */}
        {(localFilter.languages || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {(localFilter.languages || []).map(language => (
              <div 
                key={language} 
                className="bg-gray-100 px-2 py-1 rounded text-xs flex items-center gap-1"
              >
                {language}
                <button
                  type="button"
                  onClick={() => removeLanguage(language)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Aktionsbuttons */}
      <div className="flex justify-end gap-2 mt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
        >
          Abbrechen
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={applyFilters}
        >
          Filter anwenden
        </Button>
      </div>
    </div>
  )
}

/**
 * Berechnet die Anzahl der aktiven Filter
 */
export function countActiveCandidateFilters(filter: CandidateFilter): number {
  let count = 0
  
  if (filter.searchText && filter.searchText.trim() !== '') count++
  if (filter.status && filter.status.length > 0) count++
  if (filter.locations && filter.locations.length > 0) count++
  if (filter.skills && filter.skills.length > 0) count++
  if (filter.experienceMin !== undefined) count++
  if (filter.experienceMax !== undefined) count++
  if (filter.languages && filter.languages.length > 0) count++
  if (filter.sources && filter.sources.length > 0) count++
  
  return count
}
