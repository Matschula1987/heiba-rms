/**
 * API-Endpunkte für gespeicherte Filter
 */
import { NextRequest, NextResponse } from 'next/server';
import { 
  saveFilter, 
  getFilters, 
  getDefaultFilter 
} from '@/lib/filterService';
import { SavedFilter } from '@/types/filters';

/**
 * GET /api/filters - Gibt alle Filter für einen bestimmten Entitätstyp und Benutzer zurück
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const entityType = searchParams.get('entity_type') as 'job' | 'candidate' | 'customer' | null;
    const userId = searchParams.get('user_id');
    const defaultOnly = searchParams.get('default_only') === 'true';
    
    // Validiere die erforderlichen Parameter
    if (!entityType) {
      return NextResponse.json({ 
        success: false, 
        error: 'entity_type ist erforderlich' 
      }, { status: 400 });
    }
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'user_id ist erforderlich' 
      }, { status: 400 });
    }
    
    if (
      entityType !== 'job' && 
      entityType !== 'candidate' && 
      entityType !== 'customer'
    ) {
      return NextResponse.json({ 
        success: false, 
        error: 'entity_type muss einer von job, candidate oder customer sein' 
      }, { status: 400 });
    }
    
    // Nur den Standardfilter abrufen
    if (defaultOnly) {
      const filter = await getDefaultFilter(entityType, userId);
      
      return NextResponse.json({ 
        success: true, 
        filter 
      });
    }
    
    // Alle Filter abrufen
    const filters = await getFilters(entityType, userId);
    
    return NextResponse.json({ 
      success: true, 
      filters 
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Filter:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Fehler beim Abrufen der Filter.' 
    }, { status: 500 });
  }
}

/**
 * POST /api/filters - Speichert einen neuen Filter
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validiere die erforderlichen Felder
    if (!body.name || !body.entityType || !body.filter || !body.createdBy) {
      return NextResponse.json({ 
        success: false, 
        error: 'name, entityType, filter und createdBy sind erforderlich' 
      }, { status: 400 });
    }
    
    if (
      body.entityType !== 'job' && 
      body.entityType !== 'candidate' && 
      body.entityType !== 'customer'
    ) {
      return NextResponse.json({ 
        success: false, 
        error: 'entityType muss einer von job, candidate oder customer sein' 
      }, { status: 400 });
    }
    
    const filterData: Omit<SavedFilter, 'id' | 'createdAt' | 'updatedAt'> = {
      name: body.name,
      entityType: body.entityType,
      filter: body.filter,
      isDefault: !!body.isDefault,
      createdBy: body.createdBy
    };
    
    const id = await saveFilter(filterData);
    
    return NextResponse.json({ 
      success: true, 
      id,
      filter: {
        ...filterData,
        id,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Fehler beim Speichern des Filters:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Fehler beim Speichern des Filters.' 
    }, { status: 500 });
  }
}
