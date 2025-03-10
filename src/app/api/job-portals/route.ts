import { NextRequest, NextResponse } from "next/server";
import { JobPortalService, JobPortalsConfig } from "@/lib/jobPortals/JobPortalService";

// Globale Instanz des JobPortalService
let portalService: JobPortalService | null = null;

// Konfiguration aus der Datenbank laden
// In einer echten Implementierung würde diese Funktion die Konfiguration aus einer Datenbank laden
async function loadPortalConfig(): Promise<JobPortalsConfig> {
  // Simuliere das Laden aus einer Datenbank
  // In einer echten Implementierung würde hier die Konfiguration aus einer Datenbank geladen werden
  return {
    indeed: {
      enabled: true,
      // In einer echten Implementierung würden hier API-Schlüssel, etc. geladen werden
    },
    google_jobs: {
      enabled: true,
    },
    arbeitsagentur: {
      enabled: false,
      partnerId: "dummy-partner-id",
      apiKey: "", // Leerer API-Schlüssel, daher ist das Portal nicht konfiguriert
    },
  };
}

// Konfiguration in der Datenbank speichern
// In einer echten Implementierung würde diese Funktion die Konfiguration in einer Datenbank speichern
async function savePortalConfig(config: JobPortalsConfig): Promise<void> {
  // Simuliere das Speichern in einer Datenbank
  console.log("Jobportal-Konfiguration gespeichert:", config);
}

// JobPortalService initialisieren oder zurückgeben
async function getPortalService(): Promise<JobPortalService> {
  if (!portalService) {
    const config = await loadPortalConfig();
    portalService = new JobPortalService(config);
  }
  return portalService;
}

/**
 * GET /api/job-portals
 * Liefert Informationen über alle verfügbaren Jobportale und deren Konfiguration
 */
export async function GET(request: NextRequest) {
  try {
    const service = await getPortalService();
    
    // Status aller Portale abrufen
    const portalStatus = service.getPortalStatus();
    
    // Konfigurationen mit Ausnahme von Geheimnissen zurückgeben
    const config = await loadPortalConfig();
    const safeConfig: Record<string, any> = {};
    
    for (const [key, portalConfig] of Object.entries(config)) {
      // Erstelle eine sichere Kopie ohne sensible Daten
      safeConfig[key] = {
        ...portalConfig,
        // Sensible Felder entfernen oder maskieren
        apiKey: portalConfig.apiKey ? '********' : '',
        apiSecret: portalConfig.apiSecret ? '********' : '',
        accessToken: portalConfig.accessToken ? '********' : '',
      };
    }
    
    return NextResponse.json({
      portals: portalStatus,
      config: safeConfig
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Jobportal-Informationen:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Jobportal-Informationen' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/job-portals
 * Aktualisiert die Konfiguration eines oder mehrerer Jobportale
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const service = await getPortalService();
    const currentConfig = await loadPortalConfig();
    
    // Konfiguration für die spezifizierten Portale aktualisieren
    for (const [key, portalConfig] of Object.entries(data)) {
      if (typeof portalConfig !== 'object' || portalConfig === null) {
        continue;
      }
      
      // Existierende Konfiguration aktualisieren
      currentConfig[key] = {
        ...currentConfig[key],
        ...portalConfig,
      };
      
      // Konfiguration im Service aktualisieren
      service.updateConfig(key, currentConfig[key]);
    }
    
    // Aktualisierte Konfiguration speichern
    await savePortalConfig(currentConfig);
    
    // Status aller Portale zurückgeben
    const portalStatus = service.getPortalStatus();
    
    return NextResponse.json({
      success: true,
      portals: portalStatus
    });
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Jobportal-Konfiguration:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Jobportal-Konfiguration' },
      { status: 500 }
    );
  }
}
