import { NextRequest, NextResponse } from 'next/server';
import { socialMediaService } from '@/lib/socialMedia/SocialMediaService';
import { SocialMediaPlatform, SocialMediaConfig } from '@/lib/socialMedia/types';

export async function GET() {
  try {
    await socialMediaService.initialize();
    
    const availablePlatforms = socialMediaService.getAvailablePlatforms();
    const configs = socialMediaService.getAllConfigs().map(config => ({
      ...config,
      apiSecret: config.apiSecret ? '********' : undefined, // Geheime Schlüssel verbergen
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        availablePlatforms,
        configs
      }
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Social Media Konfigurationen:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Fehler beim Abrufen der Social Media Konfigurationen' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.action) {
      return NextResponse.json(
        { success: false, error: 'Keine Aktion angegeben' },
        { status: 400 }
      );
    }
    
    // Initialisiere den Service, falls noch nicht geschehen
    await socialMediaService.initialize();
    
    switch (data.action) {
      case 'configure': {
        // Konfiguriere eine Plattform
        if (!data.config || !data.config.platform) {
          return NextResponse.json(
            { success: false, error: 'Keine gültige Konfiguration angegeben' },
            { status: 400 }
          );
        }
        
        const config = data.config as SocialMediaConfig;
        const success = await socialMediaService.addPlatform(config);
        
        if (success) {
          return NextResponse.json({
            success: true,
            message: `${config.platform} wurde erfolgreich konfiguriert`
          });
        } else {
          return NextResponse.json(
            { 
              success: false, 
              error: `Fehler beim Konfigurieren von ${config.platform}` 
            },
            { status: 500 }
          );
        }
      }
      
      case 'remove': {
        // Entferne eine Plattform
        if (!data.platform) {
          return NextResponse.json(
            { success: false, error: 'Keine Plattform angegeben' },
            { status: 400 }
          );
        }
        
        const platform = data.platform as SocialMediaPlatform;
        const success = await socialMediaService.removePlatform(platform);
        
        if (success) {
          return NextResponse.json({
            success: true,
            message: `${platform} wurde erfolgreich entfernt`
          });
        } else {
          return NextResponse.json(
            { 
              success: false, 
              error: `Fehler beim Entfernen von ${platform}` 
            },
            { status: 500 }
          );
        }
      }
      
      case 'publish_job': {
        // Veröffentliche einen Job auf einer oder allen Plattformen
        if (!data.jobId || !data.jobTitle || !data.companyName || !data.location || !data.description || !data.applyUrl) {
          return NextResponse.json(
            { success: false, error: 'Unvollständige Job-Informationen' },
            { status: 400 }
          );
        }
        
        let result;
        
        if (data.platform) {
          // Veröffentliche auf einer bestimmten Plattform
          const platform = data.platform as SocialMediaPlatform;
          const adapter = socialMediaService.getAdapter(platform);
          
          if (!adapter) {
            return NextResponse.json(
              { success: false, error: `Kein Adapter für ${platform} gefunden` },
              { status: 404 }
            );
          }
          
          const post = await adapter.createJobPost(
            data.jobId,
            data.jobTitle,
            data.companyName,
            data.location,
            data.description,
            data.applyUrl,
            data.imageUrl
          );
          
          const publishedPost = await socialMediaService.publishPost(platform, post);
          
          if (publishedPost) {
            result = { [platform]: publishedPost };
          } else {
            return NextResponse.json(
              { 
                success: false, 
                error: `Fehler beim Veröffentlichen auf ${platform}` 
              },
              { status: 500 }
            );
          }
        } else {
          // Veröffentliche auf allen verfügbaren Plattformen
          result = await socialMediaService.publishJobToAllPlatforms(
            data.jobId,
            data.jobTitle,
            data.companyName,
            data.location,
            data.description,
            data.applyUrl,
            data.imageUrl
          );
          
          // Konvertiere Map zu einem Objekt für JSON-Serialisierung
          const resultObj: Record<string, any> = {};
          for (const [platform, post] of Array.from(result.entries())) {
            resultObj[platform] = post;
          }
          
          result = resultObj;
        }
        
        return NextResponse.json({
          success: true,
          data: result
        });
      }
      
      case 'search_candidates': {
        // Suche nach Kandidaten auf einer Plattform
        if (!data.platform || !data.searchParams) {
          return NextResponse.json(
            { success: false, error: 'Plattform oder Suchparameter fehlen' },
            { status: 400 }
          );
        }
        
        const platform = data.platform as SocialMediaPlatform;
        const result = await socialMediaService.searchCandidates(platform, data.searchParams);
        
        if (result) {
          return NextResponse.json({
            success: true,
            data: result
          });
        } else {
          return NextResponse.json(
            { 
              success: false, 
              error: `Fehler bei der Kandidatensuche auf ${platform}` 
            },
            { status: 500 }
          );
        }
      }
      
      case 'import_connections': {
        // Importiere Verbindungen als Kandidaten
        if (!data.platform) {
          return NextResponse.json(
            { success: false, error: 'Keine Plattform angegeben' },
            { status: 400 }
          );
        }
        
        const platform = data.platform as SocialMediaPlatform;
        const result = await socialMediaService.importConnectionsAsCandidates(
          platform,
          data.skills,
          data.jobTitles
        );
        
        if (result) {
          return NextResponse.json({
            success: true,
            data: result
          });
        } else {
          return NextResponse.json(
            { 
              success: false, 
              error: `Fehler beim Importieren der Verbindungen von ${platform}` 
            },
            { status: 500 }
          );
        }
      }
      
      case 'get_analytics': {
        // Rufe Analysen ab
        if (!data.startDate || !data.endDate || !data.period) {
          return NextResponse.json(
            { success: false, error: 'Unvollständige Analyseparameter' },
            { status: 400 }
          );
        }
        
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return NextResponse.json(
            { success: false, error: 'Ungültige Datumsformate' },
            { status: 400 }
          );
        }
        
        const analyticsMap = await socialMediaService.getAnalyticsForAllPlatforms(
          startDate,
          endDate,
          data.period
        );
        
        // Konvertiere Map zu einem Objekt für JSON-Serialisierung
        const result: Record<string, any> = {};
        for (const [platform, analytics] of Array.from(analyticsMap.entries())) {
          result[platform] = analytics;
        }
        
        return NextResponse.json({
          success: true,
          data: result
        });
      }
      
      default:
        return NextResponse.json(
          { success: false, error: `Unbekannte Aktion: ${data.action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Fehler bei der Social Media API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ein interner Serverfehler ist aufgetreten' 
      },
      { status: 500 }
    );
  }
}
