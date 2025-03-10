'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Check, 
  Clock, 
  FileText, 
  Users, 
  X, 
  CalendarIcon, 
  MailIcon, 
  ChevronDown, 
  ChevronRight, 
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ApplicationExtended, ApplicationFilter, ExtendedApplicationStatus } from '@/types/applications'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Status-Icons und Farben für Bewerbungsstatus
const statusConfig: Record<ExtendedApplicationStatus, { icon: React.ReactNode, color: string, label: string }> = {
  new: { 
    icon: <Clock className="w-4 h-4" />, 
    color: 'bg-blue-100 text-blue-800', 
    label: 'Neu'
  },
  in_review: { 
    icon: <FileText className="w-4 h-4" />, 
    color: 'bg-yellow-100 text-yellow-800', 
    label: 'In Bearbeitung'
  },
  interview: { 
    icon: <Users className="w-4 h-4" />, 
    color: 'bg-purple-100 text-purple-800', 
    label: 'Im Interview'
  },
  accepted: { 
    icon: <Check className="w-4 h-4" />, 
    color: 'bg-green-100 text-green-800', 
    label: 'Angenommen' 
  },
  rejected: { 
    icon: <X className="w-4 h-4" />, 
    color: 'bg-red-100 text-red-800', 
    label: 'Abgelehnt'
  },
  archived: { 
    icon: <FileText className="w-4 h-4" />, 
    color: 'bg-gray-100 text-gray-800', 
    label: 'Archiviert'
  }
}

// Quelle-Badges
const sourceConfig: Record<string, { color: string, label: string }> = {
  email: { color: 'bg-blue-100 text-blue-800', label: 'E-Mail' },
  portal: { color: 'bg-purple-100 text-purple-800', label: 'Jobportal' },
  website: { color: 'bg-green-100 text-green-800', label: 'Website' },
  direct: { color: 'bg-yellow-100 text-yellow-800', label: 'Direkt' },
  referral: { color: 'bg-indigo-100 text-indigo-800', label: 'Empfehlung' },
  agency: { color: 'bg-pink-100 text-pink-800', label: 'Agentur' },
  other: { color: 'bg-gray-100 text-gray-800', label: 'Andere' }
}

// Formatiert das Datum für bessere Lesbarkeit
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

const ITEMS_PER_PAGE = 10;

export default function ApplicationList() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Filter-Zustand
  const [filter, setFilter] = useState<ApplicationFilter>({
    searchText: '',
    statuses: [],
    sources: [],
    dateFrom: '',
    dateTo: '',
    hasCV: undefined,
    matchScoreMin: undefined,
    matchScoreMax: undefined,
    sortBy: 'created_at',
    sortDirection: 'desc',
    page: 0,
    pageSize: ITEMS_PER_PAGE
  });
  
  // Lade Bewerbungen bei Komponenten-Mount oder Filter-Änderung
  useEffect(() => {
    fetchApplications();
  }, [filter]);
  
  // Bewerbungen von der API laden
  const fetchApplications = async () => {
    setLoading(true);
    try {
      // Query-Parameter erstellen
      const queryParams = new URLSearchParams();
      
      if (filter.searchText) queryParams.append('search', filter.searchText);
      if (filter.statuses?.length) queryParams.append('statuses', filter.statuses.join(','));
      if (filter.sources?.length) queryParams.append('sources', filter.sources.join(','));
      if (filter.dateFrom) queryParams.append('dateFrom', filter.dateFrom);
      if (filter.dateTo) queryParams.append('dateTo', filter.dateTo);
      if (filter.hasCV !== undefined) queryParams.append('hasCV', filter.hasCV.toString());
      if (filter.matchScoreMin !== undefined) queryParams.append('matchScoreMin', filter.matchScoreMin.toString());
      if (filter.matchScoreMax !== undefined) queryParams.append('matchScoreMax', filter.matchScoreMax.toString());
      if (filter.sortBy) queryParams.append('sortBy', filter.sortBy);
      if (filter.sortDirection) queryParams.append('sortDirection', filter.sortDirection);
      if (filter.page !== undefined) queryParams.append('page', filter.page.toString());
      if (filter.pageSize !== undefined) queryParams.append('pageSize', filter.pageSize.toString());
      
      // API-Aufruf
      const response = await fetch(`/api/applications?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Fehler beim Laden der Bewerbungen: ${response.statusText}`);
      }
      
      const data = await response.json();
      setApplications(data.applications || []);
      setTotalItems(data.total || 0);
      setCurrentPage(data.page || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler beim Laden der Bewerbungen');
      console.error('Fehler beim Laden der Bewerbungen:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Zur Detailseite der Bewerbung navigieren
  const navigateToDetail = (id: string) => {
    router.push(`/dashboard/applications/${id}`);
  };
  
  // Sucheingabe aktualisieren
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(prev => ({ ...prev, searchText: e.target.value, page: 0 }));
  };
  
  // Reset-Filter
  const resetFilters = () => {
    setFilter({
      searchText: '',
      statuses: [],
      sources: [],
      dateFrom: '',
      dateTo: '',
      hasCV: undefined,
      matchScoreMin: undefined,
      matchScoreMax: undefined,
      sortBy: 'created_at',
      sortDirection: 'desc',
      page: 0,
      pageSize: ITEMS_PER_PAGE
    });
  };

  // Berechnet Seitenanzahl
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  
  // Seitenwechsel
  const changePage = (newPage: number) => {
    setFilter(prev => ({ ...prev, page: newPage }));
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bewerbungsverwaltung</h1>
      
      {/* Filter-Bereich */}
      <div className="bg-white rounded-md shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="w-full md:w-1/3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Suche nach Name, E-Mail..."
                value={filter.searchText}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetFilters}
            className="ml-auto"
          >
            Filter zurücksetzen
          </Button>
        </div>
      </div>
      
      {/* Bewerbungsliste */}
      <div className="bg-white rounded-md shadow overflow-hidden mb-6">
        {/* Tabellenkopf */}
        <div className="grid grid-cols-12 gap-2 p-4 border-b font-medium text-sm text-gray-500">
          <div className="col-span-4">Name</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Quelle</div>
          <div className="col-span-2">Datum</div>
          <div className="col-span-2">Aktionen</div>
        </div>
        
        {/* Laden-Indikator */}
        {loading && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-md h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Bewerbungen werden geladen...</p>
          </div>
        )}
        
        {/* Fehleranzeige */}
        {error && (
          <div className="p-8 text-center text-red-500">
            <p>{error}</p>
            <Button onClick={fetchApplications} className="mt-4">
              Erneut versuchen
            </Button>
          </div>
        )}
        
        {/* Keine Ergebnisse */}
        {!loading && !error && applications.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Keine Bewerbungen gefunden.</p>
            <p className="text-sm mt-1">Bitte passe die Filter an oder erstelle eine neue Bewerbung.</p>
          </div>
        )}
        
        {/* Bewerbungsliste */}
        {!loading && !error && applications.length > 0 && (
          <>
            {applications.map((application) => (
              <div 
                key={application.id}
                className="grid grid-cols-12 gap-2 p-4 border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => navigateToDetail(application.id)}
              >
                <div className="col-span-4 font-medium">
                  <div className="flex items-center">
                    <div>
                      <div>{application.applicant_name}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MailIcon className="h-3 w-3 mr-1" />
                        {application.applicant_email}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <Badge className={statusConfig[application.status].color}>
                    <span className="mr-1">{statusConfig[application.status].icon}</span>
                    {statusConfig[application.status].label}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <Badge className={sourceConfig[application.source].color}>
                    {sourceConfig[application.source].label}
                  </Badge>
                </div>
                <div className="col-span-2 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                  <span className="text-sm">{formatDate(application.created_at)}</span>
                </div>
                <div className="col-span-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        navigateToDetail(application.id);
                      }}>
                        Details anzeigen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 flex justify-center">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changePage(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    Zurück
                  </Button>
                  
                  <div className="text-sm">
                    Seite {currentPage + 1} von {totalPages}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changePage(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Weiter
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
