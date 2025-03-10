import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Candidate, QualificationProfile, Skill, Document } from '@/types';
import { saveQualificationProfilePDF, createQualificationProfileDocument } from '@/lib/pdfGenerator';
import { dummyQualificationProfiles } from '@/data/dummyQualificationProfiles';

interface QualificationProfileEditorProps {
  candidate: Candidate;
  onSave: (profile: QualificationProfile) => void;
  onAddDocument?: (document: Document) => void;
}

const QualificationProfileEditor: React.FC<QualificationProfileEditorProps> = ({
  candidate,
  onSave,
  onAddDocument
}) => {
  // Profil initialisieren, entweder aus Kandidatendaten oder Standardprofil
  const [profile, setProfile] = useState<QualificationProfile>(() => {
    if (candidate.qualificationProfile) {
      return { ...candidate.qualificationProfile };
    }
    
    // Wähle ein passendes Standardprofil basierend auf der Position des Kandidaten
    let defaultProfile = { ...dummyQualificationProfiles.default };
    
    if (candidate.position) {
      const position = candidate.position.toLowerCase();
      
      if (position.includes('backend') || position.includes('java') || position.includes('python')) {
        defaultProfile = { ...dummyQualificationProfiles['backend-dev'] };
      } else if (position.includes('devops') || position.includes('system') || position.includes('admin')) {
        defaultProfile = { ...dummyQualificationProfiles['devops-specialist'] };
      }
    }
    
    // Merge mit den vorhandenen Kandidatenfähigkeiten
    if (candidate.skills && candidate.skills.length > 0) {
      // Bestehende Skills übernehmen, wenn vorhanden
      defaultProfile.skills = candidate.skills;
    }
    
    defaultProfile.candidateId = candidate.id;
    return defaultProfile;
  });
  
  // Status für die Bearbeitbarkeit
  const [isEditing, setIsEditing] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  
  // Skill-Bearbeitung
  const [newSkill, setNewSkill] = useState<Skill>({ name: '', level: 3 });
  
  // Handlefunktionen für die Bearbeitung
  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProfile(prev => ({
      ...prev,
      summary: e.target.value
    }));
  };
  
  const handleAddSkill = () => {
    if (newSkill.name.trim()) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, { ...newSkill }]
      }));
      setNewSkill({ name: '', level: 3 });
    }
  };
  
  const handleRemoveSkill = (index: number) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };
  
  const handleSkillLevelChange = (index: number, level: number) => {
    setProfile(prev => {
      const updatedSkills = [...prev.skills];
      updatedSkills[index] = {
        ...updatedSkills[index],
        level
      };
      return {
        ...prev,
        skills: updatedSkills
      };
    });
  };
  
  const handleSaveProfile = () => {
    onSave(profile);
    setIsEditing(false);
  };
  
  const handleGeneratePDF = async () => {
    setIsPdfGenerating(true);
    try {
      // PDF generieren
      const pdfDataUrl = await saveQualificationProfilePDF(candidate, profile);
      
      // Als Dokument hinzufügen, wenn die Funktion vorhanden ist
      if (onAddDocument) {
        const { document } = createQualificationProfileDocument(candidate, pdfDataUrl);
        onAddDocument(document);
      }
      
      // PDF herunterladen
      const link = document.createElement('a');
      link.href = pdfDataUrl;
      link.download = `Qualifikationsprofil_${candidate.lastName}_${candidate.firstName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Fehler beim Generieren des PDFs:', error);
      alert('Beim Generieren des PDFs ist ein Fehler aufgetreten.');
    } finally {
      setIsPdfGenerating(false);
    }
  };
  
  // Renderfunktion für das Skillniveau
  const renderSkillLevel = (level: number) => {
    const maxLevel = 5;
    return (
      <div className="flex items-center">
        {Array.from({ length: maxLevel }).map((_, i) => (
          <span
            key={i}
            className={`text-lg ${i < level ? 'text-yellow-500' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
        <span className="ml-2 text-sm text-gray-500">
          {level === 1 && 'Grundkenntnisse'}
          {level === 2 && 'Fortgeschritten'}
          {level === 3 && 'Gute Kenntnisse'}
          {level === 4 && 'Sehr gute Kenntnisse'}
          {level === 5 && 'Experte'}
        </span>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#002451]">Qualifikationsprofil</h2>
        <div className="space-x-2">
          {!isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
              >
                Bearbeiten
              </Button>
              <Button 
                onClick={handleGeneratePDF}
                disabled={isPdfGenerating}
              >
                {isPdfGenerating ? 'Wird generiert...' : 'PDF generieren'}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
              >
                Abbrechen
              </Button>
              <Button 
                onClick={handleSaveProfile}
              >
                Speichern
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Zusammenfassung */}
      <Card>
        <CardHeader>
          <CardTitle>Berufserfahrung</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={profile.summary || ''}
              onChange={handleSummaryChange}
              placeholder="Fassen Sie hier die berufliche Erfahrung des Kandidaten zusammen..."
              className="min-h-[100px]"
            />
          ) : (
            <p className="text-gray-700">{profile.summary}</p>
          )}
        </CardContent>
      </Card>
      
      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Technische Kenntnisse & Fähigkeiten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isEditing && (
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Neue Fähigkeit"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  className="flex-1"
                />
                <Select
                  value={newSkill.level.toString()}
                  onValueChange={(value) => setNewSkill({ ...newSkill, level: parseInt(value) })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Level auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Grundkenntnisse</SelectItem>
                    <SelectItem value="2">Fortgeschritten</SelectItem>
                    <SelectItem value="3">Gute Kenntnisse</SelectItem>
                    <SelectItem value="4">Sehr gute Kenntnisse</SelectItem>
                    <SelectItem value="5">Experte</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddSkill}>Hinzufügen</Button>
              </div>
            )}
            
            <div className="space-y-2">
              {profile.skills && profile.skills.map((skill, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50">
                  <div className="font-medium">{skill.name}</div>
                  <div className="flex items-center">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Select
                          value={skill.level.toString()}
                          onValueChange={(value) => handleSkillLevelChange(index, parseInt(value))}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Level auswählen" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Grundkenntnisse</SelectItem>
                            <SelectItem value="2">Fortgeschritten</SelectItem>
                            <SelectItem value="3">Gute Kenntnisse</SelectItem>
                            <SelectItem value="4">Sehr gute Kenntnisse</SelectItem>
                            <SelectItem value="5">Experte</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveSkill(index)}
                          className="text-red-500"
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      renderSkillLevel(skill.level)
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Erfahrung */}
      <Card>
        <CardHeader>
          <CardTitle>Tätigkeitsschwerpunkte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profile.experience && profile.experience.map((exp, index) => (
              <div key={index} className="border-b pb-3 last:border-b-0">
                {typeof exp === 'string' ? (
                  <p className="text-gray-700">{exp}</p>
                ) : (
                  <div>
                    <div className="font-medium">
                      {exp.position || exp.title}
                      {exp.company && <span> bei {exp.company}</span>}
                      {exp.period && <span className="text-gray-500 ml-2">({exp.period})</span>}
                    </div>
                    {exp.description && <p className="text-gray-700 mt-1">{exp.description}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Sprachkenntnisse */}
      {profile.languages && profile.languages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sprachkenntnisse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {profile.languages.map((lang, index) => (
                <div key={index} className="flex justify-between">
                  <span>{lang.name || lang.language}</span>
                  <span className="text-gray-600">{lang.level}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Zertifikate */}
      {profile.certificates && profile.certificates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Zertifikate / Zusatzqualifikationen</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {profile.certificates.map((cert, index) => (
                <li key={index}>{cert}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QualificationProfileEditor;
