import { NextRequest, NextResponse } from 'next/server';
import { addApplicationTag, getApplicationById } from '@/lib/applicationService';
import { ensureDbInitializedForApi } from '../../../initDb';

type Params = {
  params: {
    id: string;
  };
};

/**
 * GET: Tags einer Bewerbung abrufen
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
    
    // Tags zurückgeben (diese sind bereits Teil der Bewerbung)
    return NextResponse.json({ 
      success: true, 
      tags: application.application.tags || []
    });
    
  } catch (error) {
    console.error('Error fetching application tags:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Fehler beim Abrufen der Tags', 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Tag zu einer Bewerbung hinzufügen
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    await ensureDbInitializedForApi();
    
    const { id } = params;
    const body = await req.json();
    
    // Pflichtfelder prüfen
    if (!body.tag) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Tag ist erforderlich' 
        },
        { status: 400 }
      );
    }
    
    // Tag hinzufügen
    const tag = await addApplicationTag(id, body.tag, body.createdBy);
    
    if (!tag) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Fehler beim Hinzufügen des Tags oder Bewerbung nicht gefunden' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Tag erfolgreich hinzugefügt', 
      tag
    });
    
  } catch (error) {
    console.error('Error adding application tag:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Fehler beim Hinzufügen des Tags', 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Tag von einer Bewerbung entfernen
 * 
 * Format: /api/applications/[id]/tags?tag=tagname
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await ensureDbInitializedForApi();
    
    const { id } = params;
    const url = new URL(req.url);
    const tag = url.searchParams.get('tag');
    
    if (!tag) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Tag-Parameter ist erforderlich' 
        },
        { status: 400 }
      );
    }
    
    // Bewerbung abrufen
    const application = await getApplicationById(id);
    
    if (!application || !application.application) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Bewerbung nicht gefunden' 
        },
        { status: 404 }
      );
    }
    
    // Da wir keine direkte Methode zum Löschen eines Tags haben,
    // aktualisieren wir die Bewerbung mit gefilterten Tags
    const db = await import('@/lib/db').then(m => m.getDb());
    
    const result = await db.run(
      'DELETE FROM application_tags WHERE application_id = ? AND tag = ?',
      [id, tag]
    );
    
    if (result.changes === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Tag nicht gefunden' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Tag erfolgreich entfernt'
    });
    
  } catch (error) {
    console.error('Error removing application tag:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Fehler beim Entfernen des Tags', 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
