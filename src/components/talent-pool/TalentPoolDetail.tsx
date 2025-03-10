'use client'

import React, { useEffect, useState } from 'react';
import { useTalentPoolStore } from '@/store/talentPoolStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { formatDistanceToNow, format } from 'date-fns';
import { de } from 'date-fns/locale';
import { TalentPoolNote, TalentPoolJobMatch } from '@/types/talentPool';

interface TalentPoolDetailProps {
  id: string;
}

export default function TalentPoolDetail({ id }: TalentPoolDetailProps) {
  const {
    currentEntry,
    loading,
    error,
    fetchEntry,
    updateEntry,
    notes,
    fetchNotes,
    addNote,
    activities,
    fetchActivities,
    jobMatches,
    fetchJobMatches,
    calculateJobMatches,
    updateJobMatchStatus,
    updateLastContacted
  } = useTalentPoolStore();

  const [activeTab, setActiveTab] = useState('profile');
  const [newNote, setNewNote] = useState('');
  const [editStatus, setEditStatus] = useState<string | null>(null);
  const [editRating, setEditRating] = useState<number | null>(null);
  const [editNote, setEditNote] = useState<string | null>(null);
  const [editReminderDate, setEditReminderDate] = useState<string | null>(null);

  // Lade Daten beim ersten Rendern
  useEffect(() => {
    fetchEntry(id);
    fetchNotes(id);
    fetchActivities(id);
    fetchJobMatches(id);
  }, [id, fetchEntry, fetchNotes, fetchActivities, fetchJobMatches]);

  // Aktualisiere den Status
  const handleStatusChange = async (newStatus: string) => {
    if (newStatus !== currentEntry?.status) {
      await updateEntry(id, { status: newStatus });
      setEditStatus(null);
    }
  };

  // Aktualisiere die Bewertung
  const handleRatingChange = async (newRating: number) => {
    if (newRating !== currentEntry?.rating) {
      await updateEntry(id, { rating: newRating });
      setEditRating(null);
    }
  };

  // Notiz hinzufügen
  const handleAddNote = async () => {
    if (newNote.trim()) {
      await addNote(id, 'current-user', newNote);
      setNewNote('');
    }
  };

  // Als kontaktiert markieren
  const handleMarkAsContacted = async () => {
    await updateLastContacted(id, 'current-user');
  };

  // Job-Match-Status aktualisieren
  const handleJobMatchStatusChange = async (matchId: string, newStatus: string) => {
    await updateJobMatchStatus(matchId, newStatus);
  };

  // Zeitpunkt formatieren (relativ)
  const formatTimeAgo = (dateString: string | undefined) => {
    if (!dateString) return 'Nie';
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: de });
    } catch (e) {
      return 'Ungültiges Datum';
    }
  };

  // Datum formatieren
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return format(date, 'dd.MM.yyyy', { locale: de });
    } catch (e) {
      return 'Ungültiges Datum';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="ml-2 text-gray-600">Daten werden geladen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!currentEntry) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Talent-Pool-Eintrag nicht gefunden</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header mit Basis-Informationen */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">
              {/* Hier würden wir den Namen aus entity_data anzeigen */}
              ID: {currentEntry.entity_id}
            </h2>
            <p className="text-gray-500 mt-1">
              {currentEntry.entity_type === 'candidate' ? 'Kandidat' : 'Bewerber'} - 
              Hinzugefügt am {formatDate(currentEntry.added_date)}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleMarkAsContacted}
            >
              Als kontaktiert markieren
            </Button>
            <Button>Zum Profil</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Status</CardTitle>
            </CardHeader>
            <CardContent>
              {editStatus !== null ? (
                <Select 
                  value={editStatus || currentEntry.status} 
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktiv</SelectItem>
                    <SelectItem value="inactive">Inaktiv</SelectItem>
                    <SelectItem value="contacted">Kontaktiert</SelectItem>
                    <SelectItem value="not_interested">Nicht interessiert</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div 
                  className="flex items-center cursor-pointer" 
                  onClick={() => setEditStatus(currentEntry.status)}
                >
                  <Badge className={`
                    ${currentEntry.status === 'active' ? 'bg-green-100 text-green-800' : 
                      currentEntry.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                      currentEntry.status === 'contacted' ? 'bg-blue-100 text-blue-800' : 
                      'bg-red-100 text-red-800'}
                  `}>
                    {currentEntry.status === 'active' ? 'Aktiv' : 
                     currentEntry.status === 'inactive' ? 'Inaktiv' : 
                     currentEntry.status === 'contacted' ? 'Kontaktiert' : 
                     currentEntry.status === 'not_interested' ? 'Nicht interessiert' : 
                     currentEntry.status}
                  </Badge>
                  <span className="ml-2 text-gray-400 text-sm">(Klicken zum Bearbeiten)</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bewertung */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Bewertung</CardTitle>
            </CardHeader>
            <CardContent>
              {editRating !== null ? (
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span 
                      key={i} 
                      className="text-2xl cursor-pointer" 
                      onClick={() => handleRatingChange(i + 1)}
                    >
                      {i < editRating ? '★' : '☆'}
                    </span>
                  ))}
                </div>
              ) : (
                <div 
                  className="flex items-center cursor-pointer" 
                  onClick={() => setEditRating(currentEntry.rating || 0)}
                >
                  {currentEntry.rating ? (
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="text-yellow-400 text-xl">
                          {i < currentEntry.rating! ? '★' : '☆'}
                        </span>
                      ))}
                      <span className="ml-2 text-gray-400 text-sm">(Klicken zum Bearbeiten)</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">
                      Keine Bewertung 
                      <span className="ml-2 text-sm">(Klicken zum Bearbeiten)</span>
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Letzter Kontakt */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Letzter Kontakt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">
                {formatTimeAgo(currentEntry.last_contacted)}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {currentEntry.last_contacted ? 
                  formatDate(currentEntry.last_contacted) : 
                  'Noch nicht kontaktiert'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs für verschiedene Ansichten */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="notes">Notizen</TabsTrigger>
          <TabsTrigger value="activities">Aktivitäten</TabsTrigger>
          <TabsTrigger value="job-matches">Job-Matches</TabsTrigger>
        </TabsList>

        {/* Profil-Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profil-Informationen</CardTitle>
              <CardDescription>
                Detaillierte Informationen über den Kandidaten/Bewerber
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Hier würden detaillierte Informationen aus entity_data angezeigt */}
              <p className="text-gray-500">
                Detaillierte Profildaten werden hier angezeigt, sobald sie verfügbar sind.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notizen-Tab */}
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notizen</CardTitle>
              <CardDescription>
                Interne Notizen und Anmerkungen zu diesem Eintrag
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formular für neue Notizen */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Neue Notiz hinzufügen..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <Button onClick={handleAddNote}>Notiz hinzufügen</Button>
              </div>
              
              {/* Liste der Notizen */}
              <div className="space-y-3">
                {notes.length > 0 ? (
                  notes.map((note: TalentPoolNote) => (
                    <div key={note.id} className="p-3 bg-gray-50 rounded-md">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          {note.created_by}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(note.created_at)}
                        </span>
                      </div>
                      <p className="mt-2">{note.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Keine Notizen vorhanden</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aktivitäten-Tab */}
        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aktivitäten</CardTitle>
              <CardDescription>
                Chronologische Liste aller Aktivitäten
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map(activity => (
                    <div key={activity.id} className="flex p-3 border-l-2 border-blue-500">
                      <div className="mr-4 text-gray-400">
                        {formatTimeAgo(activity.created_at)}
                      </div>
                      <div>
                        <p className="font-medium">{activity.activity_type}</p>
                        <p className="text-sm text-gray-500">
                          {activity.activity_data ? 
                            JSON.stringify(activity.activity_data) : 
                            'Keine Details verfügbar'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Keine Aktivitäten vorhanden</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Job-Matches-Tab */}
        <TabsContent value="job-matches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job-Matches</CardTitle>
              <CardDescription>
                Passende Jobs basierend auf dem Profil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button onClick={() => calculateJobMatches(id)}>
                  Job-Matches neu berechnen
                </Button>
              </div>
              
              {jobMatches.length > 0 ? (
                <div className="space-y-4">
                  {jobMatches.map((match: TalentPoolJobMatch) => (
                    <div key={match.id} className="p-4 border rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Job-ID: {match.job_id}</h3>
                          <div className="flex items-center mt-1">
                            <span className="text-sm text-gray-500">Match-Score:</span>
                            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 ml-2">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${match.match_score}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm font-medium">{match.match_score}%</span>
                          </div>
                        </div>
                        <Select
                          value={match.status}
                          onValueChange={(value) => handleJobMatchStatusChange(match.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Neu</SelectItem>
                            <SelectItem value="reviewed">Geprüft</SelectItem>
                            <SelectItem value="contacted">Kontaktiert</SelectItem>
                            <SelectItem value="rejected">Abgelehnt</SelectItem>
                            <SelectItem value="accepted">Akzeptiert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Keine Job-Matches vorhanden</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
