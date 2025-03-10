'use client'

import React, { useState, useEffect } from 'react'
import { Filter, X, Save, Search, Clock, Check, Plus, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { useFilterStore } from '@/store/filterStore'
import { SavedFilter, BaseFilter } from '@/types/filters'
import { cn } from '@/lib/utils'

export interface FilterBarProps {
  entityType: 'job' | 'candidate' | 'customer';
  userId: string;
  renderFilterInputs?: (props: {
    onClose: () => void;
  }) => React.ReactNode;
  activeFiltersCount?: number;
  className?: string;
}

/**
 * Eine Filterleiste mit Suchfunktion, gespeicherten Filtern und erweiterter Filterung
 */
export function FilterBar({
  entityType,
  userId,
  renderFilterInputs,
  activeFiltersCount = 0,
  className
}: FilterBarProps) {
  const { 
    savedFilters, 
    isLoading, 
    error,
    fetchSavedFilters, 
    saveFilter,
    deleteFilter,
    updateFilter,
    applyFilter,
    clearErrors
  } = useFilterStore()
  
  const [searchText, setSearchText] = useState('')
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [showSaveFilterDialog, setShowSaveFilterDialog] = useState(false)
  const [filterName, setFilterName] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  
  // Bei Initialisierung der Komponente Filter laden
  useEffect(() => {
    fetchSavedFilters(entityType, userId)
  }, [entityType, userId, fetchSavedFilters])
  
  // Fehler ausblenden
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearErrors()
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [error, clearErrors])
  
  // Aktuelle Filtereinstellungen zum Speichern abrufen
  const getCurrentFilter = (): BaseFilter => {
    if (entityType === 'job') {
      return useFilterStore.getState().currentJobFilter
    } else if (entityType === 'candidate') {
      return useFilterStore.getState().currentCandidateFilter
    } else {
      return useFilterStore.getState().currentCustomerFilter
    }
  }
  
  // Suchtext übernehmen
  const handleSearch = () => {
    if (entityType === 'job') {
      useFilterStore.getState().updateJobFilter({ searchText })
    } else if (entityType === 'candidate') {
      useFilterStore.getState().updateCandidateFilter({ searchText })
    } else {
      useFilterStore.getState().updateCustomerFilter({ searchText })
    }
  }
  
  // Filter speichern
  const handleSaveFilter = async () => {
    if (!filterName.trim()) return
    
    const filter: Omit<SavedFilter, 'id' | 'createdAt' | 'updatedAt'> = {
      name: filterName,
      entityType,
      filter: getCurrentFilter(),
      isDefault,
      createdBy: userId
    }
    
    await saveFilter(filter)
    setShowSaveFilterDialog(false)
    setFilterName('')
    setIsDefault(false)
  }
  
  // Gespeicherten Filter anwenden
  const handleApplyFilter = (filter: SavedFilter) => {
    applyFilter(filter)
    setShowFilterPanel(false)
  }
  
  // Gespeicherten Filter als Standard setzen
  const handleSetDefaultFilter = async (filter: SavedFilter) => {
    if (filter.isDefault) return
    
    await updateFilter(filter.id, { isDefault: true })
  }
  
  // Gespeicherten Filter löschen
  const handleDeleteFilter = async (filterId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation()
    }
    
    await deleteFilter(filterId)
  }
  
  // Filter zurücksetzen
  const handleResetFilters = () => {
    if (entityType === 'job') {
      useFilterStore.getState().resetJobFilter()
    } else if (entityType === 'candidate') {
      useFilterStore.getState().resetCandidateFilter()
    } else {
      useFilterStore.getState().resetCustomerFilter()
    }
    
    setSearchText('')
    setShowFilterPanel(false)
  }
  
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Fehleranzeige */}
      {error && (
        <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {/* Hauptfilterleiste */}
      <div className="flex items-center gap-2 w-full">
        {/* Suchfeld */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Suche..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 pr-4 py-2 w-full"
          />
        </div>
        
        {/* Erweiterte Filter Button */}
        <Popover open={showFilterPanel} onOpenChange={setShowFilterPanel}>
          <PopoverTrigger asChild>
            <Button 
              variant={activeFiltersCount > 0 ? "default" : "outline"} 
              size="sm"
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="p-4 border-b">
              <h3 className="font-semibold mb-2">Filter</h3>
              {renderFilterInputs ? renderFilterInputs({ 
                onClose: () => setShowFilterPanel(false) 
              }) : (
                <p className="text-sm text-gray-500">
                  Keine erweiterten Filter verfügbar
                </p>
              )}
            </div>
            
            {/* Gespeicherte Filter */}
            <div className="p-4 border-b max-h-60 overflow-y-auto">
              <h4 className="text-sm font-medium mb-2">Gespeicherte Filter</h4>
              {isLoading ? (
                <p className="text-sm text-gray-500">Lade Filter...</p>
              ) : savedFilters.length === 0 ? (
                <p className="text-sm text-gray-500">Keine gespeicherten Filter</p>
              ) : (
                <div className="space-y-2">
                  {savedFilters
                    .filter(f => f.entityType === entityType)
                    .map(filter => (
                      <div 
                        key={filter.id}
                        className="flex items-center justify-between gap-2 p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
                        onClick={() => handleApplyFilter(filter)}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {filter.isDefault && (
                            <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                          )}
                          <span className="text-sm truncate">{filter.name}</span>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleApplyFilter(filter)}>
                              <Check className="h-4 w-4 mr-2" />
                              Anwenden
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleSetDefaultFilter(filter)}
                              disabled={filter.isDefault}
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Als Standard setzen
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFilter(filter.id);
                              }}
                              className="text-red-600"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                </div>
              )}
            </div>
            
            {/* Filter-Aktionen */}
            <div className="p-4 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleResetFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Zurücksetzen
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowSaveFilterDialog(true)}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Speichern
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Filter-Dropdown für Schnellzugriff auf gespeicherte Filter */}
        {savedFilters.filter(f => f.entityType === entityType).length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2"
              >
                <Clock className="h-4 w-4" />
                Gespeicherte Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {savedFilters
                .filter(f => f.entityType === entityType)
                .map(filter => (
                  <DropdownMenuItem 
                    key={filter.id} 
                    onClick={() => handleApplyFilter(filter)}
                  >
                    <div className="flex items-center gap-2">
                      {filter.isDefault && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                      <span>{filter.name}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        {/* Suchen-Button */}
        <Button
          onClick={handleSearch}
          size="sm"
        >
          <Search className="h-4 w-4 mr-2" />
          Suchen
        </Button>
      </div>
      
      {/* Dialog zum Speichern eines Filters */}
      {showSaveFilterDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Filter speichern</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <Input
                  type="text"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="Name des Filters"
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="default-filter"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="default-filter" className="text-sm text-gray-700">
                  Als Standardfilter verwenden
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowSaveFilterDialog(false)}
              >
                Abbrechen
              </Button>
              <Button
                disabled={!filterName.trim()}
                onClick={handleSaveFilter}
              >
                Speichern
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
