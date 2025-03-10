import { NextResponse } from 'next/server';
import { pipelineManager } from '@/lib/scheduler/PipelineManager';
import { 
  PipelineType, 
  SocialMediaPlatform, 
  EntityType, 
  SocialMediaPostConfig, 
  MovidoPostConfig,
  PostPipelineItemOptions,
  PipelineStatus
} from '@/types/scheduler';

/**
 * API-Endpunkt für die Pipeline-Funktionalität
 * Ermöglicht die Verwaltung von Social Media und Movido-Posts
 */

// GET /api/scheduler/pipeline - Holt Pipeline-Items mit Filteroptionen
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filteroptionen aus den Query-Parametern extrahieren
    const status = searchParams.get('status');
    const pipelineType = searchParams.get('pipelineType') as PipelineType | null;
    const platform = searchParams.get('platform') as SocialMediaPlatform | null;
    const entityType = searchParams.get('entityType') as EntityType | null;
    const entityId = searchParams.get('entityId');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const priority = searchParams.has('priority') ? Number(searchParams.get('priority')) : undefined;
    const limit = searchParams.has('limit') ? Number(searchParams.get('limit')) : undefined;
    const offset = searchParams.has('offset') ? Number(searchParams.get('offset')) : undefined;
    
    // Optionen für die Abfrage erstellen
    const options: PostPipelineItemOptions = {};
    
    if (status) {
      options.status = status as PipelineStatus;
    }
    
    if (pipelineType) {
      options.pipelineType = pipelineType;
    }
    
    if (platform) {
      options.platform = platform;
    }
    
    if (entityType) {
      options.entityType = entityType;
    }
    
    if (entityId) {
      options.entityId = entityId;
    }
    
    if (fromDate) {
      options.fromDate = fromDate;
    }
    
    if (toDate) {
      options.toDate = toDate;
    }
    
    if (priority !== undefined) {
      options.priority = priority;
    }
    
    if (limit !== undefined) {
      options.limit = limit;
    }
    
    if (offset !== undefined) {
      options.offset = offset;
    }
    
    // Items mit Filtern abrufen
    const items = await pipelineManager.getItems(options);
    
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Fehler beim Abrufen der Pipeline-Items:', error);
    return NextResponse.json(
      { error: `Fehler beim Abrufen der Pipeline-Items: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// POST /api/scheduler/pipeline - Fügt ein neues Item zur Pipeline hinzu
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validierung der erforderlichen Felder
    if (!data.pipelineType || !data.entityType || !data.entityId) {
      return NextResponse.json(
        { error: 'Fehlende Pflichtfelder (pipelineType, entityType, entityId)' },
        { status: 400 }
      );
    }
    
    let itemId: string;
    
    // Je nach Pipeline-Typ den entsprechenden Manager aufrufen
    if (data.pipelineType === 'social_media') {
      if (!data.platform) {
        return NextResponse.json(
          { error: 'Fehlende Plattform für Social-Media-Posts' },
          { status: 400 }
        );
      }
      
      // Erstelle ein Social-Media-Post-Item
      itemId = await pipelineManager.createSocialMediaPostItem(
        data.entityType as EntityType,
        data.entityId as string,
        data.platform as SocialMediaPlatform,
        data.postConfig as SocialMediaPostConfig,
        data.priority || 0
      );
    } else if (data.pipelineType === 'movido') {
      // Erstelle ein Movido-Post-Item
      itemId = await pipelineManager.createMovidoPostItem(
        data.entityType as EntityType,
        data.entityId as string,
        data.postConfig as MovidoPostConfig,
        data.priority || 0
      );
    } else {
      return NextResponse.json(
        { error: `Ungültiger Pipeline-Typ: ${data.pipelineType}` },
        { status: 400 }
      );
    }
    
    // Item abrufen und zurückgeben
    const item = await pipelineManager.getItemById(itemId);
    
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Fehler beim Hinzufügen des Items zur Pipeline:', error);
    return NextResponse.json(
      { error: `Fehler beim Hinzufügen des Items zur Pipeline: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// DELETE /api/scheduler/pipeline?id=itemId - Entfernt ein Item aus der Pipeline
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Fehlende Item-ID' },
        { status: 400 }
      );
    }
    
    const success = await pipelineManager.removeFromPipeline(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Item nicht gefunden oder konnte nicht entfernt werden' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fehler beim Entfernen des Items aus der Pipeline:', error);
    return NextResponse.json(
      { error: `Fehler beim Entfernen des Items aus der Pipeline: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
