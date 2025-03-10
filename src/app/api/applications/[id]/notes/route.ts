import { NextRequest, NextResponse } from 'next/server';
import { addApplicationNote, getApplicationById } from '@/lib/applicationService';
import { ensureDbInitializedForApi } from '../../../initDb';

type Params = {
  params: {
    id: string;
  };
};

/**
 * GET: Notizen einer Bewerbung abrufen
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    await ensureDbInitializedForApi();
    
    const { id } = params;
    
    // Bewerbung abrufen
    const application = await getApplicationById(id);
    
    if (!application) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Bewerbung nicht gefunden' 
        },
        { status: 404 }
      );
    }
    
    // Notizen zurückgeben (diese sind bereits Teil der Bewerbung)
    return NextResponse.json({ 
      success: true, 
      notes: application.application.notes || []
    });
    
  } catch (error) {
    console.error('Error fetching application notes:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Fehler beim Abrufen der Notizen', 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Notiz zu einer Bewerbung hinzufügen
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    await ensureDbInitializedForApi();
    
    const { id } = params;
    const body = await req.json();
    
    // Pflichtfelder prüfen
    if (!body.content) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Inhalt ist erforderlich' 
        },
        { status: 400 }
      );
    }
    
    // Benutzer-ID setzen (falls nicht angegeben)
    const userId = body.userId || 'system';
    
    // Notiz hinzufügen
    const note = await addApplicationNote(id, userId, body.content);
    
    if (!note) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Fehler beim Hinzufügen der Notiz oder Bewerbung nicht gefunden' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Notiz erfolgreich hinzugefügt', 
      note
    });
    
  } catch (error) {
    console.error('Error adding application note:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Fehler beim Hinzufügen der Notiz', 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
