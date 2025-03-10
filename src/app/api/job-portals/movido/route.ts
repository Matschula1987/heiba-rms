import { NextRequest, NextResponse } from 'next/server';
import { ExtendedJobPortalService } from '@/lib/jobPortals/ExtendedJobPortalService';
import { getDb } from '@/lib/db';
import { Job } from '@/types/jobs';

// Instanziiere den erweiterten JobPortalService
const jobPortalService = new ExtendedJobPortalService();

/**
 * GET-Handler für Movido-Integrationen
 * Ruft aktive Veröffentlichungen oder Bewerbungen von Movido ab
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  
  try {
    if (type === 'applications') {
      // Rufe Bewerbungen von Movido ab
      const applications = await jobPortalService.getMovidoApplications();
      return NextResponse.json({ applications });
    } else {
      // Standardmäßig aktive Veröffentlichungen abrufen
      const activePostings = await jobPortalService.getMovidoActivePostings();
      return NextResponse.json({ activePostings });
    }
  } catch (error) {
    console.error('Fehler bei der Movido-Integration:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Daten von Movido' },
      { status: 500 }
    );
  }
}

/**
 * POST-Handler für Movido-Integrationen
 * Veröffentlicht oder aktualisiert Jobs über Movido
 */
export async function POST(request: NextRequest) {
  try {
    const { jobId, targetPortals } = await request.json();
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job-ID ist erforderlich' },
        { status: 400 }
      );
    }
    
    // Lade den Job aus der Datenbank
    const db = await getDb();
    const job = await db.all('SELECT * FROM jobs WHERE id = ?', [jobId]) as Job[];
    
    if (!job || job.length === 0) {
      return NextResponse.json(
        { error: 'Job nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Veröffentliche den Job über Movido
    const result = await jobPortalService.publishViaMovido(job[0], targetPortals);
    
    if (result.success) {
      // Speichere die Veröffentlichungsdetails in der Datenbank
      const db = await getDb();
      await db.run(
        'INSERT INTO job_postings (job_id, platform, platform_job_id, posting_url, status, publication_date, auto_republish, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          jobId,
          'movido',
          result.platformJobId,
          result.postingUrl,
          'published',
          new Date().toISOString(),
          true,
          new Date().toISOString(),
          new Date().toISOString()
        ]
      );
      
      return NextResponse.json({
        success: true,
        message: 'Job erfolgreich über Movido veröffentlicht',
        result
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.errorMessage || 'Unbekannter Fehler bei der Veröffentlichung',
        result
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Fehler bei der Movido-Integration:', error);
    return NextResponse.json(
      { error: 'Fehler bei der Veröffentlichung über Movido' },
      { status: 500 }
    );
  }
}

/**
 * DELETE-Handler für Movido-Integrationen
 * Löscht einen Job von Movido und allen zugehörigen Portalen
 */
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const externalId = searchParams.get('externalId');
  
  if (!externalId) {
    return NextResponse.json(
      { error: 'Externe Job-ID ist erforderlich' },
      { status: 400 }
    );
  }
  
  try {
    // Hole den Movido-Adapter und lösche den Job
    const adapter = jobPortalService.getAdapter('movido');
    const config = jobPortalService.getConfig('movido');
    
    if (!adapter || !config?.enabled) {
      return NextResponse.json(
        { error: 'Movido-Integration nicht verfügbar' },
        { status: 400 }
      );
    }
    
    const success = await adapter.deleteJob(externalId, config);
    
    if (success) {
      // Aktualisiere den Status in der Datenbank
      const db = await getDb();
      await db.run(
        'UPDATE job_postings SET status = ?, updated_at = ? WHERE platform = ? AND platform_job_id = ?',
        ['deleted', new Date().toISOString(), 'movido', externalId]
      );
      
      return NextResponse.json({
        success: true,
        message: 'Job erfolgreich von Movido gelöscht'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Fehler beim Löschen des Jobs von Movido'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Fehler bei der Movido-Integration:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Jobs von Movido' },
      { status: 500 }
    );
  }
}
