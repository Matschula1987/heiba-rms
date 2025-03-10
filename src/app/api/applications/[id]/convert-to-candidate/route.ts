import { NextRequest, NextResponse } from 'next/server';
import { convertToCandidate } from '@/lib/applicationService';
import { autoProfileService } from '@/lib/autoProfileService';
import { ensureDbInitializedForApi } from '../../../initDb';

type Params = {
  params: {
    id: string;
  };
};

/**
 * POST: Bewerber in einen Kandidaten konvertieren
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    await ensureDbInitializedForApi();
    
    const { id } = params;
    const body = await req.json();
    
    // Benutzer-ID ist erforderlich für die Nachverfolgung
    const userId = body.userId || 'system';
    
    // Prüfen, ob zusätzliche Automatisierungen gewünscht sind
    const useAutoProfile = body.useAutoProfile === true;
    
    if (useAutoProfile) {
      // Verwende den AutoProfileService für die vollständige Verarbeitung
      const result = await autoProfileService.processApplicationToCandidate(id, userId, {
        addToTalentPool: body.addToTalentPool !== false,
        generateProfile: body.generateProfile !== false,
        sendEmailToCustomers: body.sendEmailToCustomers === true,
        sendEmailToPortals: body.sendEmailToPortals === true,
        emailConfigId: body.emailConfigId,
        customMessage: body.customMessage
      });
      
      if (!result.success) {
        return NextResponse.json(
          { 
            success: false, 
            message: result.error || 'Konvertierung fehlgeschlagen' 
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Bewerbung erfolgreich in Kandidat konvertiert und Profil erstellt', 
        candidateId: result.candidateId,
        talentPoolId: result.talentPoolId,
        profileDocumentId: result.profileDocumentId,
        emailsSent: result.emailsSent
      });
    } else {
      // Standard-Konvertierung ohne weitere Automatisierung
      const result = await convertToCandidate(id, userId);
      
      if (!result) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Konvertierung fehlgeschlagen oder Bewerbung nicht gefunden' 
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Bewerbung erfolgreich in Kandidat konvertiert', 
        candidateId: result.candidateId,
        application: result.application
      });
    }
  } catch (error) {
    console.error('Error converting application to candidate:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Fehler bei der Konvertierung zum Kandidaten', 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
