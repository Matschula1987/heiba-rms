/**
 * API-Endpunkte für gespeicherte Filter (Einzeloperationen)
 */
import { NextRequest, NextResponse } from 'next/server';
import { 
  getFilter, 
  updateFilter, 
  deleteFilter 
} from '@/lib/filterService';

/**
 * GET /api/filters/[id] - Gibt einen gespeicherten Filter anhand seiner ID zurück
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Filter-ID ist erforderlich' 
      }, { status: 400 });
    }
    
    const filter = await getFilter(id);
    
    if (!filter) {
      return NextResponse.json({ 
        success: false, 
        error: 'Filter nicht gefunden' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      filter 
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Filters:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Fehler beim Abrufen des Filters.' 
    }, { status: 500 });
  }
}

/**
 * PUT /api/filters/[id] - Aktualisiert einen gespeicherten Filter
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Filter-ID ist erforderlich' 
      }, { status: 400 });
    }
    
    // Prüfen, ob der Filter existiert
    const existingFilter = await getFilter(id);
    
    if (!existingFilter) {
      return NextResponse.json({ 
        success: false, 
        error: 'Filter nicht gefunden' 
      }, { status: 404 });
    }
    
    // Filter aktualisieren
    const success = await updateFilter(id, {
      name: body.name,
      entityType: body.entityType,
      filter: body.filter,
      isDefault: body.isDefault,
      createdBy: body.createdBy
    });
    
    if (success) {
      // Aktualisierten Filter zurückgeben
      const updatedFilter = await getFilter(id);
      
      return NextResponse.json({ 
        success: true, 
        filter: updatedFilter
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Filter konnte nicht aktualisiert werden' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Filters:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Fehler beim Aktualisieren des Filters.' 
    }, { status: 500 });
  }
}

/**
 * DELETE /api/filters/[id] - Löscht einen gespeicherten Filter
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Filter-ID ist erforderlich' 
      }, { status: 400 });
    }
    
    // Prüfen, ob der Filter existiert
    const existingFilter = await getFilter(id);
    
    if (!existingFilter) {
      return NextResponse.json({ 
        success: false, 
        error: 'Filter nicht gefunden' 
      }, { status: 404 });
    }
    
    // Filter löschen
    const success = await deleteFilter(id);
    
    if (success) {
      return NextResponse.json({ 
        success: true 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Filter konnte nicht gelöscht werden' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Fehler beim Löschen des Filters:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Fehler beim Löschen des Filters.' 
    }, { status: 500 });
  }
}
