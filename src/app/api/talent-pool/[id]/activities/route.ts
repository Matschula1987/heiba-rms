import { NextRequest, NextResponse } from 'next/server';
import { TalentPoolService } from '@/lib/talentPoolService';

/**
 * GET /api/talent-pool/[id]/activities
 * Ruft alle Aktivitäten zu einem Talent-Pool-Eintrag ab
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Tabellen initialisieren, falls nicht vorhanden
    await TalentPoolService.initTalentPoolTables();
    
    const id = params.id;
    
    try {
      // Aktivitäten abrufen
      const activities = await TalentPoolService.getActivitiesByTalentPoolId(id);
      return NextResponse.json(activities);
    } catch (error: any) {
      // Wenn der Eintrag nicht gefunden wurde
      if (error.message?.includes('nicht gefunden')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      throw error;
    }
  } catch (error: any) {
    console.error('Fehler beim Abrufen der Aktivitäten:', error);
    return NextResponse.json(
      { error: error.message || 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}
