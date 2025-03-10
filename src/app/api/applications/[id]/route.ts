import { NextRequest, NextResponse } from 'next/server';
import { 
  getApplicationById, 
  updateApplication, 
  deleteApplication 
} from '@/lib/applicationService';
import { UpdateApplicationParams } from '@/types/applications';
import { ensureDbInitializedForApi } from '../../initDb';

type Params = {
  params: {
    id: string;
  };
};

/**
 * GET: Einzelne Bewerbung abrufen
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
    
    return NextResponse.json(application);
    
  } catch (error) {
    console.error('Error fetching application:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Fehler beim Abrufen der Bewerbung', 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * PUT: Bewerbung aktualisieren
 */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await ensureDbInitializedForApi();
    
    const { id } = params;
    const body = await req.json();
    
    // Prüfen, ob die Bewerbung existiert
    const existingApplication = await getApplicationById(id);
    
    if (!existingApplication) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Bewerbung nicht gefunden' 
        },
        { status: 404 }
      );
    }
    
    // Validieren, dass bestimmte Felder, wenn sie geändert werden, gültige Werte haben
    if (body.status && !['new', 'in_review', 'interview', 'accepted', 'rejected', 'archived'].includes(body.status)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Ungültiger Status' 
        },
        { status: 400 }
      );
    }
    
    if (body.source && !['email', 'portal', 'website', 'direct', 'referral', 'agency', 'other'].includes(body.source)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Ungültige Quelle' 
        },
        { status: 400 }
      );
    }
    
    // Typ für den Request-Body anwenden
    const updateParams: UpdateApplicationParams = {
      ...body,
      // Sicherstellen, dass komplexe Typen korrekt behandelt werden
      match_data: body.match_data ? (
        typeof body.match_data === 'string' ? body.match_data : JSON.stringify(body.match_data)
      ) : undefined,
      
      communication_history: body.communication_history ? (
        typeof body.communication_history === 'string' ? body.communication_history : JSON.stringify(body.communication_history)
      ) : undefined
    };
    
    // Bewerbung aktualisieren
    const updatedApplication = await updateApplication(id, updateParams);
    
    if (!updatedApplication) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Fehler beim Aktualisieren der Bewerbung' 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Bewerbung erfolgreich aktualisiert', 
      application: updatedApplication.application 
    });
    
  } catch (error) {
    console.error('Error updating application:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Fehler beim Aktualisieren der Bewerbung', 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Bewerbung löschen
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await ensureDbInitializedForApi();
    
    const { id } = params;
    
    // Prüfen, ob die Bewerbung existiert
    const existingApplication = await getApplicationById(id);
    
    if (!existingApplication) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Bewerbung nicht gefunden' 
        },
        { status: 404 }
      );
    }
    
    // Bewerbung löschen
    const success = await deleteApplication(id);
    
    if (!success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Fehler beim Löschen der Bewerbung' 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Bewerbung erfolgreich gelöscht' 
    });
    
  } catch (error) {
    console.error('Error deleting application:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Fehler beim Löschen der Bewerbung', 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
