'use client'

import React from 'react';
import { TalentPoolEntry } from '@/types/talentPool';
import { useTalentPoolStore } from '@/store/talentPoolStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface TalentPoolListProps {
  loading: boolean;
  entries: TalentPoolEntry[];
  total: number;
  entityType?: 'candidate' | 'application';
}

export default function TalentPoolList({ 
  loading, 
  entries, 
  total,
  entityType 
}: TalentPoolListProps) {
  const { filter, setFilter, fetchEntry } = useTalentPoolStore();
  
  // Paginierung
  const pageSize = filter.pageSize || 20;
  const currentPage = filter.page || 0;
  const totalPages = Math.ceil(total / pageSize);
  
  // Nächste Seite
  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setFilter({ page: currentPage + 1 });
    }
  };
  
  // Vorherige Seite
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setFilter({ page: currentPage - 1 });
    }
  };
  
  // Detailansicht öffnen
  const handleEntryClick = (id: string) => {
    window.location.href = `/dashboard/talent-pool/${id}`;
  };
  
  // Statusstyling
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'contacted':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'not_interested':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    }
  };
  
  // Formatiert das Datum relativ (z.B. "vor 3 Tagen")
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Nie';
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: de });
    } catch (e) {
      return 'Ungültiges Datum';
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Ladezustand */}
      {loading && (
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Daten werden geladen...</p>
        </div>
      )}
      
      {/* Keine Einträge */}
      {!loading && entries.length === 0 && (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Keine Einträge gefunden.</p>
        </div>
      )}
      
      {/* Talent-Pool-Tabelle */}
      {!loading && entries.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bewertung</TableHead>
                <TableHead>Zuletzt kontaktiert</TableHead>
                <TableHead>Erinnerung</TableHead>
                <TableHead>Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow 
                  key={entry.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleEntryClick(entry.id)}
                >
                  <TableCell className="font-medium">
                    {/* Hier würden wir den Namen aus den entity_data anzeigen, 
                        aber für jetzt zeigen wir einfach die ID an */}
                    ID: {entry.entity_id}
                  </TableCell>
                  <TableCell>
                    {entry.entity_type === 'candidate' ? 'Kandidat' : 'Bewerber'}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeClass(entry.status)}>
                      {entry.status === 'active' ? 'Aktiv' : 
                       entry.status === 'inactive' ? 'Inaktiv' : 
                       entry.status === 'contacted' ? 'Kontaktiert' : 
                       entry.status === 'not_interested' ? 'Nicht interessiert' : 
                       entry.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {entry.rating ? 
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className="text-yellow-400">
                            {i < entry.rating! ? '★' : '☆'}
                          </span>
                        ))}
                      </div> :
                      <span className="text-gray-400">Keine Bewertung</span>
                    }
                  </TableCell>
                  <TableCell>
                    {formatDate(entry.last_contacted)}
                  </TableCell>
                  <TableCell>
                    {entry.reminder_date ? 
                      formatDate(entry.reminder_date) : 
                      <span className="text-gray-400">Keine</span>
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {entry.tags ? (
                        Array.isArray(entry.tags) && entry.tags.length > 0 ? (
                          entry.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="outline" className="bg-blue-50">
                              {tag}
                            </Badge>
                          ))
                        ) : typeof entry.tags === 'string' ? (
                          <Badge variant="outline" className="bg-blue-50">
                            {entry.tags}
                          </Badge>
                        ) : null
                      ) : (
                        <span className="text-gray-400">Keine Tags</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Paginierung */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              Zeige {currentPage * pageSize + 1} bis {Math.min((currentPage + 1) * pageSize, total)} von {total} Einträgen
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handlePrevPage}
                disabled={currentPage === 0}
              >
                Zurück
              </Button>
              <Button 
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages - 1}
              >
                Weiter
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
