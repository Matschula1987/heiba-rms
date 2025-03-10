import { NextRequest, NextResponse } from 'next/server';
import { TalentPoolService } from '@/lib/talentPoolService';

/**
 * GET /api/talent-pool/[id]/job-matches
 * Ruft alle Job-Matches zu einem Talent-Pool-Eintrag ab
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
      // Job-Matches abrufen
      const matches = await TalentPoolService.getJobMatchesByTalentPoolId(id);
      return NextResponse.json(matches);
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
    console.error('Fehler beim Abrufen der Job-Matches:', error);
    return NextResponse.json(
      { error: error.message || 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/talent-pool/[id]/job-matches
 * Berechnet neue Job-Matches für einen Talent-Pool-Eintrag
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Tabellen initialisieren, falls nicht vorhanden
    await TalentPoolService.initTalentPoolTables();
    
    const id = params.id;
    
    try {
      // Neue Job-Matches berechnen
      const matches = await TalentPoolService.calculateJobMatches(id);
      return NextResponse.json(matches, { status: 201 });
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
    console.error('Fehler beim Berechnen der Job-Matches:', error);
    return NextResponse.json(
      { error: error.message || 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}
