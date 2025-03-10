'use client'

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useTalentPoolStore } from '@/store/talentPoolStore';
import { TalentPoolFilter as TalentPoolFilterType } from '@/types/talentPool';

export default function TalentPoolFilter() {
  const { filter, setFilter, fetchEntries } = useTalentPoolStore();
  
  // Lokaler Zustand für die Filter-Einstellungen im Dialog
  const [localFilter, setLocalFilter] = useState<Partial<TalentPoolFilterType>>(filter);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Aktive Filter zählen
  const countActiveFilters = () => {
    let count = 0;
    if (filter.search) count++;
    if (filter.entity_type) count++;
    if (filter.statuses && filter.statuses.length > 0) count++;
    if (filter.minRating !== undefined || filter.maxRating !== undefined) count++;
    if (filter.tags && filter.tags.length > 0) count++;
    if (filter.addedSince || filter.addedBefore) count++;
    if (filter.contactedSince || filter.contactedBefore) count++;
    if (filter.reminderFrom || filter.reminderTo) count++;
    return count;
  };
  
  // Such-Eingabe verarbeiten
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({ search: e.target.value || undefined, page: 0 });
  };
  
  // Filter zurücksetzen
  const resetFilters = () => {
    setFilter({
      search: undefined,
      entity_type: undefined,
      statuses: undefined,
      minRating: undefined,
      maxRating: undefined,
      tags: undefined,
      addedSince: undefined,
      addedBefore: undefined,
      contactedSince: undefined,
      contactedBefore: undefined,
      reminderFrom: undefined,
      reminderTo: undefined,
      page: 0
    });
    setLocalFilter({});
    setDialogOpen(false);
  };
  
  // Filter anwenden
  const applyFilters = () => {
    setFilter({ ...localFilter, page: 0 });
    setDialogOpen(false);
  };
  
  // Status-Auswahl ändern
  const handleStatusChange = (value: string) => {
    setLocalFilter(prev => ({
      ...prev,
      statuses: value === 'all' ? undefined : [value as any]
    }));
  };
  
  // Rating-Auswahl ändern
  const handleRatingChange = (min: string, max: string) => {
    setLocalFilter(prev => ({
      ...prev,
      minRating: min ? parseInt(min) : undefined,
      maxRating: max ? parseInt(max) : undefined
    }));
  };
  
  // Tag-Eingabe verarbeiten
  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setLocalFilter(prev => ({
      ...prev,
      tags: tags.length > 0 ? tags : undefined
    }));
  };
  
  return (
    <div className="flex items-center space-x-2">
      {/* Suchfeld */}
      <div className="flex-1">
        <Input
          type="text"
          placeholder="Suchen..."
          value={filter.search || ''}
          onChange={handleSearchChange}
          className="w-full"
        />
      </div>
      
      {/* Erweiterter Filter-Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="relative">
            Filter
            {countActiveFilters() > 0 && (
              <Badge className="ml-2 bg-blue-500 hover:bg-blue-600">
                {countActiveFilters()}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Erweiterte Filteroptionen</DialogTitle>
            <DialogDescription>
              Passen Sie die Filter an, um die passenden Talent-Pool-Einträge zu finden.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Status-Filter */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={
                  localFilter.statuses && localFilter.statuses.length > 0 
                    ? localFilter.statuses[0] 
                    : 'all'
                }
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Alle Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="inactive">Inaktiv</SelectItem>
                  <SelectItem value="contacted">Kontaktiert</SelectItem>
                  <SelectItem value="not_interested">Nicht interessiert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Rating-Filter */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Bewertung
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Select
                  value={localFilter.minRating !== undefined ? localFilter.minRating.toString() : ''}
                  onValueChange={(val) => handleRatingChange(val, localFilter.maxRating !== undefined ? localFilter.maxRating.toString() : '')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Min" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Beliebig</SelectItem>
                    <SelectItem value="1">★</SelectItem>
                    <SelectItem value="2">★★</SelectItem>
                    <SelectItem value="3">★★★</SelectItem>
                    <SelectItem value="4">★★★★</SelectItem>
                    <SelectItem value="5">★★★★★</SelectItem>
                  </SelectContent>
                </Select>
                <span>bis</span>
                <Select
                  value={localFilter.maxRating !== undefined ? localFilter.maxRating.toString() : ''}
                  onValueChange={(val) => handleRatingChange(localFilter.minRating !== undefined ? localFilter.minRating.toString() : '', val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Max" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Beliebig</SelectItem>
                    <SelectItem value="1">★</SelectItem>
                    <SelectItem value="2">★★</SelectItem>
                    <SelectItem value="3">★★★</SelectItem>
                    <SelectItem value="4">★★★★</SelectItem>
                    <SelectItem value="5">★★★★★</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Tags-Filter */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tags" className="text-right">
                Tags
              </Label>
              <Input
                id="tags"
                placeholder="Tag1, Tag2, Tag3"
                value={localFilter.tags ? Array.isArray(localFilter.tags) ? localFilter.tags.join(', ') : localFilter.tags : ''}
                onChange={(e) => handleTagsChange(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={resetFilters}>
              Zurücksetzen
            </Button>
            <Button onClick={applyFilters}>
              Filter anwenden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Sortierungsauswahl */}
      <Select
        value={`${filter.sortBy || 'added_date'}-${filter.sortDirection || 'desc'}`}
        onValueChange={(value) => {
          const [sortBy, sortDirection] = value.split('-');
          setFilter({ sortBy, sortDirection: sortDirection as 'asc' | 'desc' });
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sortierung" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="added_date-desc">Neueste zuerst</SelectItem>
          <SelectItem value="added_date-asc">Älteste zuerst</SelectItem>
          <SelectItem value="rating-desc">Beste Bewertung</SelectItem>
          <SelectItem value="rating-asc">Schlechteste Bewertung</SelectItem>
          <SelectItem value="last_contacted-desc">Zuletzt kontaktiert</SelectItem>
          <SelectItem value="last_contacted-asc">Am längsten nicht kontaktiert</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
