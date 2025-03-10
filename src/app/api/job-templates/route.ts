import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { JobTemplate } from '@/types/jobs';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/job-templates
 * Gibt alle Textbausteine für Stellenanzeigen zurück
 * Optionale Query-Parameter: category
 */
export async function GET(request: NextRequest) {
  try {
    // Parameter auslesen
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    
    // Simulierte Datenbankabfrage (später durch echte DB ersetzen)
    // In einer echten Implementierung würden wir die Daten aus der Datenbank laden
    let templates: JobTemplate[] = [
      { 
        id: '1', 
        name: 'Standardbeschreibung Unternehmen', 
        category: 'company_description',
        content: '<p>Als führendes Unternehmen in unserer Branche bieten wir ein dynamisches Arbeitsumfeld mit flachen Hierarchien und kurzen Entscheidungswegen. Bei uns erwartet Sie ein engagiertes Team, das gemeinsam an innovativen Lösungen arbeitet.</p>',
        created_by: 'System',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '2', 
        name: 'IT-Anforderungen', 
        category: 'requirements',
        content: '<ul><li>Abgeschlossenes Studium der Informatik oder vergleichbare Ausbildung</li><li>Mehrjährige Berufserfahrung in der Softwareentwicklung</li><li>Sehr gute Kenntnisse in [Technologie]</li><li>Teamfähigkeit und eigenverantwortliches Arbeiten</li><li>Gute Deutsch- und Englischkenntnisse</li></ul>',
        created_by: 'System',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '3', 
        name: 'Standard Benefits', 
        category: 'benefits',
        content: '<ul><li>Attraktives Gehalt</li><li>Flexible Arbeitszeiten</li><li>30 Tage Urlaub</li><li>Betriebliche Altersvorsorge</li><li>Regelmäßige Weiterbildungen</li><li>Moderner Arbeitsplatz</li></ul>',
        created_by: 'System',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '4', 
        name: 'Remote-Arbeit Benefits', 
        category: 'benefits',
        content: '<ul><li>Flexible Remote-Arbeit möglich</li><li>Moderne Ausstattung für das Home-Office</li><li>Regelmäßige Team-Events</li><li>Attraktives Gehalt</li><li>30 Tage Urlaub</li></ul>',
        created_by: 'System',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '5', 
        name: 'Frontend-Entwickler Anforderungen', 
        category: 'requirements',
        content: '<ul><li>Mehrjährige Erfahrung mit HTML, CSS und JavaScript</li><li>Gute Kenntnisse in React oder Angular</li><li>Verständnis von responsivem Design</li><li>Erfahrung mit REST-APIs</li><li>Teamfähigkeit und eigenverantwortliches Arbeiten</li></ul>',
        created_by: 'System',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '6', 
        name: 'Backend-Entwickler Anforderungen', 
        category: 'requirements',
        content: '<ul><li>Mehrjährige Erfahrung mit Java, C# oder Python</li><li>Gute Kenntnisse in Datenbankdesign (SQL)</li><li>Erfahrung mit Microservices</li><li>Verständnis von Cloud-Architektur</li><li>Teamfähigkeit und eigenverantwortliches Arbeiten</li></ul>',
        created_by: 'System',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '7', 
        name: 'Moderne Tech-Firma Beschreibung', 
        category: 'company_description',
        content: '<p>Als innovatives Technologieunternehmen entwickeln wir zukunftsweisende Lösungen, die den digitalen Wandel vorantreiben. In unserem agilen Arbeitsumfeld fördern wir Kreativität, offenen Austausch und kontinuierliche Weiterentwicklung. Werden Sie Teil unseres dynamischen Teams und gestalten Sie mit uns die Zukunft!</p>',
        created_by: 'System',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    // Nach Kategorie filtern, wenn angegeben
    if (category) {
      templates = templates.filter(template => template.category === category);
    }
    
    return NextResponse.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Textbausteine:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Textbausteine' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/job-templates
 * Erstellt einen neuen Textbaustein
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validierung
    if (!data.name || !data.content || !data.category) {
      return NextResponse.json(
        { error: 'Name, Inhalt und Kategorie sind erforderlich' },
        { status: 400 }
      );
    }
    
    // Neuen Textbaustein erstellen
    const newTemplate: JobTemplate = {
      id: uuidv4(),
      name: data.name,
      category: data.category,
      content: data.content,
      created_by: data.created_by || 'User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // In einer echten Implementierung würden wir den Textbaustein in der Datenbank speichern
    // db.jobTemplates.create(newTemplate);
    
    return NextResponse.json({
      success: true,
      template: newTemplate
    });
  } catch (error) {
    console.error('Fehler beim Erstellen des Textbausteins:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Textbausteins' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/job-templates
 * Aktualisiert einen Textbaustein
 */
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validierung
    if (!data.id || !data.name || !data.content || !data.category) {
      return NextResponse.json(
        { error: 'ID, Name, Inhalt und Kategorie sind erforderlich' },
        { status: 400 }
      );
    }
    
    // In einer echten Implementierung würden wir den Textbaustein in der Datenbank aktualisieren
    // const updatedTemplate = await db.jobTemplates.update(data.id, {
    //   name: data.name,
    //   category: data.category,
    //   content: data.content,
    //   updated_at: new Date().toISOString()
    // });
    
    // Simulierte Aktualisierung
    const updatedTemplate: JobTemplate = {
      ...data,
      updated_at: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      template: updatedTemplate
    });
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Textbausteins:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Textbausteins' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/job-templates
 * Löscht einen Textbaustein
 */
export async function DELETE(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validierung
    if (!data.id) {
      return NextResponse.json(
        { error: 'ID ist erforderlich' },
        { status: 400 }
      );
    }
    
    // In einer echten Implementierung würden wir den Textbaustein in der Datenbank löschen
    // await db.jobTemplates.delete(data.id);
    
    return NextResponse.json({
      success: true,
      message: `Textbaustein mit ID ${data.id} erfolgreich gelöscht`
    });
  } catch (error) {
    console.error('Fehler beim Löschen des Textbausteins:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Textbausteins' },
      { status: 500 }
    );
  }
}
