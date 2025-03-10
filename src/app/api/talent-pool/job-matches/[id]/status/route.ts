import { NextRequest, NextResponse } from 'next/server';
import { TalentPoolService } from '@/lib/talentPoolService';

/**
 * PATCH /api/talent-pool/job-matches/[id]/status
 * Aktualisiert den Status eines Job-Matches
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Tabellen initialisieren, falls nicht vorhanden
    await TalentPoolService.initTalentPoolTables();
    
    const id = params.id;
    
    // Request-Body auslesen
    const body = await request.json();
    
    // Parameter validieren
    if (!body.status) {
      return NextResponse.json(
        { error: 'status ist erforderlich' },
        { status: 400 }
      );
    }
    
    // Status aktualisieren
    const result = await TalentPoolService.updateJobMatchStatus(id, body.status);
    
    if (!result) {
      return NextResponse.json(
        { error: `Job-Match mit ID ${id} nicht gefunden` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Fehler beim Aktualisieren des Job-Match-Status:', error);
    return NextResponse.json(
      { error: error.message || 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}
