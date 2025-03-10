// src/components/candidates/CandidateDocuments.tsx
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Document } from '@/types'
import { FileIcon, DownloadIcon, EyeIcon } from 'lucide-react'

interface CandidateDocumentsProps {
  documents: Document[];
}

export function CandidateDocuments({ documents }: CandidateDocumentsProps) {
  // Formatiert die Dateigröße in ein lesbares Format (KB, MB, etc.)
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Bestimmt ein passendes Icon basierend auf dem Dateityp
  const getFileIcon = (type: string) => {
    return <FileIcon className="h-5 w-5" />;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Dokumente</CardTitle>
        <Button variant="outline" size="sm">Dokument hochladen</Button>
      </CardHeader>
      <CardContent>
        {documents && documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map((doc, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 rounded-md border hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(doc.type)}
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Anzeigen
                  </Button>
                  <Button variant="ghost" size="sm">
                    <DownloadIcon className="h-4 w-4 mr-1" />
                    Herunterladen
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Keine Dokumente vorhanden</p>
        )}
      </CardContent>
    </Card>
  )
}
