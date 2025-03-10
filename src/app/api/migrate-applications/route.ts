import { NextRequest, NextResponse } from 'next/server';
import { 
  migrateApplicationsSchema, 
  insertApplicationTestData,
  checkApplicationsTablesExist
} from '@/lib/migrateApplications';

/**
 * GET: Überprüfen, ob die Bewerbungstabellen bereits existieren
 */
export async function GET(req: NextRequest) {
  try {
    const exists = await checkApplicationsTablesExist();
    
    return NextResponse.json({
      success: true,
      exists
    });
    
  } catch (error) {
    console.error('Error checking applications tables existence:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Fehler bei der Überprüfung der Bewerbungstabellen', 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Bewerbungstabellen erstellen und optional Testdaten einfügen
 */
export async function POST(req: NextRequest) {
  try {
    // Prüfen, ob die Tabellen bereits existieren
    const exists = await checkApplicationsTablesExist();
    
    if (exists) {
      return NextResponse.json({
        success: true,
        message: 'Bewerbungstabellen existieren bereits',
        migrated: false
      });
    }
    
    // Tabellen erstellen
    await migrateApplicationsSchema();
    
    // Prüfen, ob Testdaten eingefügt werden sollen
    const body = await req.json().catch(() => ({ insertTestData: false }));
    
    if (body.insertTestData) {
      await insertApplicationTestData();
      
      return NextResponse.json({
        success: true,
        message: 'Bewerbungstabellen erstellt und Testdaten eingefügt',
        migrated: true,
        testDataInserted: true
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Bewerbungstabellen erfolgreich erstellt',
      migrated: true,
      testDataInserted: false
    });
    
  } catch (error) {
    console.error('Error migrating applications schema:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Fehler bei der Migration der Bewerbungstabellen', 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
