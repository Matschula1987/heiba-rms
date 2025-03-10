'use client'

import React from 'react'
import { useFilterStore } from '@/store/filterStore'
import { JobFilter, JOB_STATUS_OPTIONS } from '@/types/filters'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

interface JobFilterInputsProps {
  onClose: () => void;
}

/**
 * Panel mit Filteroptionen speziell für Jobs
 * Wird in der FilterBar-Komponente verwendet
 */
export function JobFilterInputs({ onClose }: JobFilterInputsProps) {
  const { currentJobFilter, updateJobFilter } = useFilterStore()
  
  const [localFilter, setLocalFilter] = React.useState<Partial<JobFilter>>({
    status: currentJobFilter.status || [],
    jobTypes: currentJobFilter.jobTypes || [],
    locations: currentJobFilter.locations ? [...currentJobFilter.locations] : [],
    departments: currentJobFilter.departments ? [...currentJobFilter.departments] : [],
    minSalary: currentJobFilter.minSalary,
    maxSalary: currentJobFilter.maxSalary
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
  
  // Arbeitsform-Filter Toggle
  const toggleJobType = (jobType: string) => {
    setLocalFilter(prev => {
      const currentTypes = prev.jobTypes || []
      const newTypes = currentTypes.includes(jobType)
        ? currentTypes.filter(t => t !== jobType)
        : [...currentTypes, jobType]
      
      return {
        ...prev,
        jobTypes: newTypes
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
  
  // Abteilung hinzufügen
  const addDepartment = (department: string) => {
    if (!department.trim()) return
    
    setLocalFilter(prev => ({
      ...prev,
      departments: [...(prev.departments || []), department.trim()]
    }))
    
    // Input-Feld leeren
    const departmentInput = document.getElementById('department-input') as HTMLInputElement
    if (departmentInput) departmentInput.value = ''
  }
  
  // Abteilung entfernen
  const removeDepartment = (department: string) => {
    setLocalFilter(prev => ({
      ...prev,
      departments: (prev.departments || []).filter(d => d !== department)
    }))
  }
  
  // Filter anwenden
  const applyFilters = () => {
    updateJobFilter(localFilter)
    onClose()
  }
  
  return (
    <div className="space-y-4">
      {/* Status-Filter */}
      <div>
        <h4 className="text-sm font-medium mb-2">Status</h4>
        <div className="grid grid-cols-2 gap-2">
          {JOB_STATUS_OPTIONS.map(status => (
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
      
      {/* Arbeitsform-Filter */}
      <div>
        <h4 className="text-sm font-medium mb-2">Arbeitsform</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'Vollzeit', label: 'Vollzeit' },
            { value: 'Teilzeit', label: 'Teilzeit' },
            { value: 'Remote', label: 'Remote' },
            { value: 'Hybrid', label: 'Hybrid' },
            { value: 'Freelance', label: 'Freelance' }
          ].map(jobType => (
            <div key={jobType.value} className="flex items-center gap-2">
              <Checkbox
                id={`jobType-${jobType.value}`}
                checked={(localFilter.jobTypes || []).includes(jobType.value)}
                onCheckedChange={() => toggleJobType(jobType.value)}
              />
              <Label htmlFor={`jobType-${jobType.value}`} className="text-sm cursor-pointer">
                {jobType.label}
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
      
      {/* Abteilungs-Filter */}
      <div>
        <h4 className="text-sm font-medium mb-2">Abteilung</h4>
        <div className="flex gap-2 mb-2">
          <Input
            id="department-input"
            placeholder="Abteilung hinzufügen"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addDepartment((e.target as HTMLInputElement).value)
                e.preventDefault()
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const input = document.getElementById('department-input') as HTMLInputElement
              addDepartment(input.value)
            }}
          >
            +
          </Button>
        </div>
        
        {/* Liste der ausgewählten Abteilungen */}
        {(localFilter.departments || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {(localFilter.departments || []).map(department => (
              <div 
                key={department} 
                className="bg-gray-100 px-2 py-1 rounded text-xs flex items-center gap-1"
              >
                {department}
                <button
                  type="button"
                  onClick={() => removeDepartment(department)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Gehalt-Filter */}
      <div>
        <h4 className="text-sm font-medium mb-2">Gehalt</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Mindestens (€)</label>
            <Input
              type="number"
              placeholder="Min"
              value={localFilter.minSalary || ''}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) : undefined
                setLocalFilter(prev => ({ ...prev, minSalary: value }))
              }}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Höchstens (€)</label>
            <Input
              type="number"
              placeholder="Max"
              value={localFilter.maxSalary || ''}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) : undefined
                setLocalFilter(prev => ({ ...prev, maxSalary: value }))
              }}
            />
          </div>
        </div>
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
export function countActiveJobFilters(filter: JobFilter): number {
  let count = 0
  
  if (filter.searchText && filter.searchText.trim() !== '') count++
  if (filter.status && filter.status.length > 0) count++
  if (filter.jobTypes && filter.jobTypes.length > 0) count++
  if (filter.locations && filter.locations.length > 0) count++
  if (filter.departments && filter.departments.length > 0) count++
  if (filter.minSalary !== undefined) count++
  if (filter.maxSalary !== undefined) count++
  
  return count
}
