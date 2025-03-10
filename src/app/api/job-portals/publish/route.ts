import { NextRequest, NextResponse } from "next/server";
import { JobPortalService } from "@/lib/jobPortals/JobPortalService";
import { getPortalService } from "@/app/api/job-portals/helpers";

/**
 * POST /api/job-portals/publish
 * Veröffentlicht eine Stelle auf ausgewählten Plattformen
 * Body: { jobId: string, platforms?: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const { jobId, platforms } = await request.json();
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job-ID ist erforderlich' },
        { status: 400 }
      );
    }
    
    // Job-Daten laden
    const jobResponse = await fetch(`${request.nextUrl.origin}/api/jobs/${jobId}`);
    if (!jobResponse.ok) {
      return NextResponse.json(
        { error: 'Stelle nicht gefunden' },
        { status: 404 }
      );
    }
    
    const job = await jobResponse.json();
    
    // Job-Portal-Service laden
    const service = await getPortalService();
    
    // Auf ausgewählten oder allen aktivierten Plattformen veröffentlichen
    const results = await service.publishJob(job, platforms);
    
    // Erfolgreiche Veröffentlichungen zählen
    const successCount = Object.values(results).filter((result: any) => result.success).length;
    
    return NextResponse.json({
      success: true,
      message: `Stelle auf ${successCount} Plattformen veröffentlicht`,
      results
    });
  } catch (error) {
    console.error('Fehler bei der Veröffentlichung:', error);
    return NextResponse.json(
      { error: 'Fehler bei der Veröffentlichung der Stelle' },
      { status: 500 }
    );
  }
}
