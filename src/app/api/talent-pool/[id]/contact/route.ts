import { NextRequest, NextResponse } from 'next/server';
import { TalentPoolService } from '@/lib/talentPoolService';

/**
 * POST /api/talent-pool/[id]/contact
 * Aktualisiert den Kontaktzeitpunkt eines Talent-Pool-Eintrags
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Tabellen initialisieren, falls nicht vorhanden
    await TalentPoolService.initTalentPoolTables();
    
    const id = params.id;
    
    // Request-Body auslesen
    const body = await request.json();
    
    // Kontaktzeitpunkt aktualisieren
    const result = await TalentPoolService.updateLastContacted(id, body.contacted_by);
    
    if (!result) {
      return NextResponse.json(
        { error: `Talent-Pool-Eintrag mit ID ${id} nicht gefunden` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Fehler beim Aktualisieren des Kontaktzeitpunkts:', error);
    return NextResponse.json(
      { error: error.message || 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}
