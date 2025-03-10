import { NextRequest, NextResponse } from 'next/server';
import { calculateApplicationMatch } from '@/lib/applicationService';
import { ensureDbInitializedForApi } from '../../../initDb';

type Params = {
  params: {
    id: string;
  };
};

/**
 * POST: Match-Score einer Bewerbung berechnen oder aktualisieren
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    await ensureDbInitializedForApi();
    
    const { id } = params;
    
    // Match-Score berechnen
    const matchResult = await calculateApplicationMatch(id);
    
    // Der calculateApplicationMatch aktualisiert direkt die Datenbank mit dem Ergebnis
    if (!matchResult) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Fehler bei der Match-Berechnung oder Bewerbung nicht gefunden' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Match-Score erfolgreich berechnet', 
      score: matchResult.score,
      details: matchResult.details
    });
    
  } catch (error) {
    console.error('Error calculating application match score:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Fehler bei der Berechnung des Match-Scores', 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
