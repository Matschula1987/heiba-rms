import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Candidate, QualificationProfile, Document } from '@/types';
import QualificationProfileEditor from './QualificationProfileEditor';
import { useCandidateStore } from '@/store/candidateStore';

interface CandidateQualificationProfileProps {
  candidate: Candidate;
  onAddDocument?: (document: Document) => void;
}

export default function CandidateQualificationProfile({ 
  candidate,
  onAddDocument
}: CandidateQualificationProfileProps) {
  const { updateCandidate } = useCandidateStore();
  
  // Funktion zum Speichern des aktualisierten Profils
  const handleSaveProfile = async (updatedProfile: QualificationProfile) => {
    if (!candidate) return;
    
    try {
      const updatedCandidate = {
        ...candidate,
        qualificationProfile: updatedProfile
      };
      
      await updateCandidate(candidate.id, updatedCandidate);
    } catch (error) {
      console.error('Fehler beim Speichern des Qualifikationsprofils:', error);
      alert('Beim Speichern des Qualifikationsprofils ist ein Fehler aufgetreten.');
    }
  };
  
  // Funktion zum Hinzufügen eines Dokuments (zur Kandidatenakte)
  const handleAddDocument = (document: Document) => {
    if (onAddDocument) {
      onAddDocument(document);
    } else {
      // Wenn keine externe Funktion übergeben wurde, fügen wir es direkt zum Kandidaten hinzu
      const updatedCandidate = {
        ...candidate,
        documents: [...(candidate.documents || []), document]
      };
      
      updateCandidate(candidate.id, updatedCandidate)
        .catch(error => console.error('Fehler beim Hinzufügen des Dokuments:', error));
    }
  };
  
  return (
    <div className="space-y-6">
      <QualificationProfileEditor 
        candidate={candidate} 
        onSave={handleSaveProfile}
        onAddDocument={handleAddDocument}
      />
    </div>
  );
}
