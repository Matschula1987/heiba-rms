import { NextRequest, NextResponse } from 'next/server';
import { changeApplicationStatus } from '@/lib/applicationService';
import { ChangeApplicationStatusParams, ExtendedApplicationStatus } from '@/types/applications';
import { ensureDbInitializedForApi } from '../../../initDb';

type Params = {
  params: {
    id: string;
  };
};

/**
 * PATCH: Status einer Bewerbung ändern
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await ensureDbInitializedForApi();
    
    const { id } = params;
    const body = await req.json();
    
    // Pflichtfelder prüfen
    if (!body.status) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Status ist erforderlich' 
        },
        { status: 400 }
      );
    }
    
    // Validieren, dass der Status gültig ist
    if (!['new', 'in_review', 'interview', 'accepted', 'rejected', 'archived'].includes(body.status)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Ungültiger Status' 
        },
        { status: 400 }
      );
    }
    
    // Typ für den Request-Body anwenden
    const statusParams: ChangeApplicationStatusParams = {
      application_id: id,
      status: body.status as ExtendedApplicationStatus,
      reason: body.reason,
      changed_by: body.changed_by || 'system'
    };
    
    // Status ändern
    const updatedApplication = await changeApplicationStatus(statusParams);
    
    if (!updatedApplication) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Fehler beim Ändern des Status oder Bewerbung nicht gefunden' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Status erfolgreich geändert', 
      application: updatedApplication.application 
    });
    
  } catch (error) {
    console.error('Error changing application status:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Fehler beim Ändern des Status', 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
