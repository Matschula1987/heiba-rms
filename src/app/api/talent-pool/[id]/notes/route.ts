import { NextRequest, NextResponse } from 'next/server';
import { TalentPoolService } from '@/lib/talentPoolService';
import { AddTalentPoolNoteParams } from '@/types/talentPool';

/**
 * GET /api/talent-pool/[id]/notes
 * Ruft alle Notizen zu einem Talent-Pool-Eintrag ab
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
      // Notizen abrufen
      const notes = await TalentPoolService.getNotesByTalentPoolId(id);
      return NextResponse.json(notes);
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
    console.error('Fehler beim Abrufen der Notizen:', error);
    return NextResponse.json(
      { error: error.message || 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/talent-pool/[id]/notes
 * Fügt eine neue Notiz zu einem Talent-Pool-Eintrag hinzu
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
    
    // Parameter validieren
    if (!body.created_by || !body.content) {
      return NextResponse.json(
        { error: 'created_by und content sind erforderlich' },
        { status: 400 }
      );
    }
    
    const noteParams: AddTalentPoolNoteParams = {
      talent_pool_id: id,
      created_by: body.created_by,
      content: body.content,
      note_type: body.note_type
    };
    
    try {
      // Notiz hinzufügen
      const note = await TalentPoolService.addNoteToPalentPoolEntry(noteParams);
      
      if (!note) {
        return NextResponse.json(
          { error: 'Fehler beim Hinzufügen der Notiz' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(note, { status: 201 });
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
    console.error('Fehler beim Hinzufügen der Notiz:', error);
    return NextResponse.json(
      { error: error.message || 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}
