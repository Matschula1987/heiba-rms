import { NextRequest, NextResponse } from 'next/server';
import { migrateJobsSchema, checkJobTablesExist } from '@/lib/migrateJobs';

export async function GET(req: NextRequest) {
  try {
    // Prüfen, ob die Tabellen bereits existieren
    const jobTablesExist = await checkJobTablesExist();
    
    if (jobTablesExist) {
      return NextResponse.json({ 
        success: true, 
        message: 'Die erweiterten Job-Tabellen sind bereits vorhanden.', 
        alreadyMigrated: true 
      });
    }
    
    // Migration ausführen
    await migrateJobsSchema();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Die Jobs-Tabellen wurden erfolgreich migriert!',
      alreadyMigrated: false
    });
  } catch (error) {
    console.error('Fehler bei der Migration der Jobs-Tabellen:', error);
    
    return NextResponse.json({ 
      success: false, 
      message: 'Bei der Migration ist ein Fehler aufgetreten.',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
