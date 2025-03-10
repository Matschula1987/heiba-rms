import { NextRequest, NextResponse } from 'next/server';
import { 
  getApplications, 
  createApplication 
} from '@/lib/applicationService';
import { 
  ApplicationFilter, 
  CreateApplicationParams, 
  ExtendedApplicationStatus, 
  ApplicationSource 
} from '@/types/applications';
import { ensureDbInitializedForApi } from '../initDb';

/**
 * GET: Abrufen von Bewerbungen mit Filtern
 */
export async function GET(req: NextRequest) {
  try {
    await ensureDbInitializedForApi();
    
    const url = new URL(req.url);
    
    // Filter-Parameter aus Query-String extrahieren
    const searchText = url.searchParams.get('search') || '';
    const statuses = url.searchParams.get('statuses')?.split(',') || [];
    const sources = url.searchParams.get('sources')?.split(',') || [];
    const jobIds = url.searchParams.get('jobIds')?.split(',') || [];
    const assignedTo = url.searchParams.get('assignedTo')?.split(',') || [];
    const tags = url.searchParams.get('tags')?.split(',') || [];
    
    const matchScoreMin = url.searchParams.get('matchScoreMin') ? 
      parseInt(url.searchParams.get('matchScoreMin')!) : undefined;
    
    const matchScoreMax = url.searchParams.get('matchScoreMax') ? 
      parseInt(url.searchParams.get('matchScoreMax')!) : undefined;
    
    const dateFrom = url.searchParams.get('dateFrom') || '';
    const dateTo = url.searchParams.get('dateTo') || '';
    
    const hasCV = url.searchParams.has('hasCV') ? 
      url.searchParams.get('hasCV') === 'true' : undefined;
    
    const page = url.searchParams.get('page') ? 
      parseInt(url.searchParams.get('page')!) : 0;
    
    const pageSize = url.searchParams.get('pageSize') ? 
      parseInt(url.searchParams.get('pageSize')!) : 20;
    
    const sortBy = url.searchParams.get('sortBy') || 'created_at';
    const sortDirection = url.searchParams.get('sortDirection') || 'desc';
    
    // Typensichere Umwandlung der Status-Werte
    const validStatuses = statuses.filter(status => 
      ['new', 'in_review', 'interview', 'accepted', 'rejected', 'archived'].includes(status)
    ) as ExtendedApplicationStatus[];
    
    // Typensichere Umwandlung der Source-Werte
    const validSources = sources.filter(source => 
      ['email', 'portal', 'website', 'direct', 'referral', 'agency', 'other'].includes(source)
    ) as ApplicationSource[];
    
    // Filter-Objekt erstellen
    const filter: ApplicationFilter = {
      searchText,
      statuses: validStatuses,
      sources: validSources,
      jobIds,
      assignedTo,
      tags,
      matchScoreMin,
      matchScoreMax,
      dateFrom,
      dateTo,
      hasCV,
      page,
      pageSize,
      sortBy,
      sortDirection: sortDirection as 'asc' | 'desc'
    };
    
    // Bewerbungen abrufen
    const applications = await getApplications(filter);
    
    return NextResponse.json(applications);
    
  } catch (error) {
    console.error('Error fetching applications:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Fehler beim Abrufen der Bewerbungen', 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Neue Bewerbung erstellen
 */
export async function POST(req: NextRequest) {
  try {
    await ensureDbInitializedForApi();
    
    const body = await req.json();
    
    // Notwendige Felder validieren
    if (!body.applicant_name || !body.applicant_email) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Name und E-Mail sind erforderlich' 
        },
        { status: 400 }
      );
    }
    
    // Typ für den Request-Body anwenden
    const params: CreateApplicationParams = {
      applicant_name: body.applicant_name,
      applicant_email: body.applicant_email,
      applicant_phone: body.applicant_phone,
      applicant_location: body.applicant_location,
      source: body.source || 'email',
      source_detail: body.source_detail,
      job_id: body.job_id,
      status: body.status || 'new',
      cover_letter: body.cover_letter,
      has_cv: !!body.has_cv,
      cv_file_path: body.cv_file_path,
      has_documents: !!body.has_documents,
      documents_paths: body.documents_paths
    };
    
    // Neue Bewerbung erstellen
    const application = await createApplication(params);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Bewerbung erfolgreich erstellt', 
      application: application.application 
    });
    
  } catch (error) {
    console.error('Error creating application:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Fehler beim Erstellen der Bewerbung', 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
