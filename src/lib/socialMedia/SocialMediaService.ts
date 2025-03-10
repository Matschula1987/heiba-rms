import { getDb } from '../db';
import { BaseSocialAdapter } from './BaseSocialAdapter';
import { LinkedInAdapter } from './adapters/LinkedInAdapter';
import { XingAdapter } from './adapters/XingAdapter';
import { FacebookAdapter } from './adapters/FacebookAdapter';
import { InstagramAdapter } from './adapters/InstagramAdapter';
import { 
  SocialMediaPlatform, 
  SocialMediaConfig, 
  SocialMediaPost, 
  SocialMediaProfile, 
  SocialMediaConnection,
  SocialMediaSearchParams,
  SocialMediaSearchResult,
  SocialMediaAnalytics
} from './types';

/**
 * Service-Klasse zur Verwaltung aller Social Media Integrationen
 */
export class SocialMediaService {
  private adapters: Map<SocialMediaPlatform, BaseSocialAdapter> = new Map();
  private configs: Map<SocialMediaPlatform, SocialMediaConfig> = new Map();
  private static instance: SocialMediaService;

  private constructor() {
    // Private Konstruktor für Singleton-Pattern
  }

  /**
   * Gibt die Singleton-Instanz des SocialMediaService zurück
   */
  public static getInstance(): SocialMediaService {
    if (!SocialMediaService.instance) {
      SocialMediaService.instance = new SocialMediaService();
    }
    return SocialMediaService.instance;
  }

  /**
   * Initialisiert den Service mit den gespeicherten Konfigurationen aus der Datenbank
   */
  public async initialize(): Promise<void> {
    try {
      // Lade Konfigurationen aus der Datenbank
      const configs = await this.loadConfigurationsFromDb();
      
      // Initialisiere Adapter für jede aktive Konfiguration
      for (const config of configs) {
        if (config.active) {
          await this.addPlatform(config);
        }
      }
      
      console.log(`Social Media Service initialisiert mit ${this.adapters.size} aktiven Plattformen`);
    } catch (error) {
      console.error('Fehler bei der Initialisierung des Social Media Service:', error);
    }
  }

  /**
   * Lädt die gespeicherten Social Media Konfigurationen aus der Datenbank
   */
  private async loadConfigurationsFromDb(): Promise<SocialMediaConfig[]> {
    try {
      // Hier würden wir die Konfigurationen aus der Datenbank laden
      // Für Entwicklungszwecke verwenden wir Beispieldaten
      
      // In einer realen Implementierung:
      // const configsData = await db.all('SELECT * FROM social_media_configs');
      
      const configs: SocialMediaConfig[] = [
        {
          platform: 'linkedin',
          apiKey: 'dummy_linkedin_api_key',
          apiSecret: 'dummy_linkedin_api_secret',
          redirectUri: 'https://heiba-recruitment.example.com/auth/linkedin/callback',
          active: true,
          settings: {
            autoPost: false,
            postFrequency: 'weekly',
            postTemplate: '{{companyName}} sucht: {{jobTitle}} in {{location}}\n\n{{description}}\n\nBewerben Sie sich jetzt: {{applyUrl}}',
            useCompanyAccount: true,
            allowComments: true,
            targetGroups: ['it-professionals', 'developers']
          }
        },
        {
          platform: 'xing',
          apiKey: 'dummy_xing_api_key',
          apiSecret: 'dummy_xing_api_secret',
          redirectUri: 'https://heiba-recruitment.example.com/auth/xing/callback',
          active: true,
          settings: {
            autoPost: false,
            postFrequency: 'manual',
            useCompanyAccount: true
          }
        },
        {
          platform: 'facebook',
          apiKey: 'dummy_facebook_api_key',
          apiSecret: 'dummy_facebook_api_secret',
          redirectUri: 'https://heiba-recruitment.example.com/auth/facebook/callback',
          active: false,
          settings: {
            autoPost: false,
            postFrequency: 'manual',
            useCompanyAccount: true,
            allowComments: true
          }
        },
        {
          platform: 'instagram',
          apiKey: 'dummy_instagram_api_key',
          apiSecret: 'dummy_instagram_api_secret',
          redirectUri: 'https://heiba-recruitment.example.com/auth/instagram/callback',
          active: false,
          settings: {
            autoPost: false,
            postFrequency: 'manual',
            useCompanyAccount: true
          }
        }
      ];
      
      // Speichere Konfigurationen im Speicher
      for (const config of configs) {
        this.configs.set(config.platform, config);
      }
      
      return configs;
    } catch (error) {
      console.error('Fehler beim Laden der Social Media Konfigurationen:', error);
      return [];
    }
  }

  /**
   * Speichert eine Konfiguration in der Datenbank
   */
  private async saveConfigurationToDb(config: SocialMediaConfig): Promise<boolean> {
    try {
      // Hier würden wir die Konfiguration in der Datenbank speichern
      // In einer realen Implementierung:
      /*
      await db.run(`
        INSERT OR REPLACE INTO social_media_configs 
        (platform, api_key, api_secret, redirect_uri, active, settings)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        config.platform,
        config.apiKey,
        config.apiSecret,
        config.redirectUri,
        config.active ? 1 : 0,
        JSON.stringify(config.settings)
      ]);
      */
      
      // Aktualisiere Konfiguration im Speicher
      this.configs.set(config.platform, config);
      
      return true;
    } catch (error) {
      console.error('Fehler beim Speichern der Social Media Konfiguration:', error);
      return false;
    }
  }

  /**
   * Fügt eine neue Social Media Plattform hinzu oder aktualisiert eine bestehende
   */
  public async addPlatform(config: SocialMediaConfig): Promise<boolean> {
    try {
      // Speichere Konfiguration in der Datenbank
      await this.saveConfigurationToDb(config);
      
      // Wenn die Plattform nicht aktiv ist, initialisiere keinen Adapter
      if (!config.active) {
        return true;
      }
      
      // Initialisiere den entsprechenden Adapter basierend auf der Plattform
      let adapter: BaseSocialAdapter;
      
      switch (config.platform) {
        case 'linkedin':
          adapter = new LinkedInAdapter(config);
          break;
        case 'xing':
          adapter = new XingAdapter(config);
          break;
        case 'facebook':
          adapter = new FacebookAdapter(config);
          break;
        case 'instagram':
          adapter = new InstagramAdapter(config);
          break;
        default:
          throw new Error(`Unbekannte Social Media Plattform: ${config.platform}`);
      }
      
      // Teste die Verbindung
      const isConnected = await adapter.testConnection();
      
      if (!isConnected) {
        throw new Error(`Konnte keine Verbindung zu ${config.platform} herstellen`);
      }
      
      // Speichere den Adapter
      this.adapters.set(config.platform, adapter);
      
      return true;
    } catch (error) {
      console.error(`Fehler beim Hinzufügen der Plattform ${config.platform}:`, error);
      return false;
    }
  }

  /**
   * Entfernt eine Social Media Plattform
   */
  public async removePlatform(platform: SocialMediaPlatform): Promise<boolean> {
    try {
      // Entferne Adapter aus dem Speicher
      this.adapters.delete(platform);
      
      // Deaktiviere Konfiguration
      const config = this.configs.get(platform);
      
      if (config) {
        config.active = false;
        await this.saveConfigurationToDb(config);
      }
      
      // In einer realen Implementierung:
      // await db.run('UPDATE social_media_configs SET active = 0 WHERE platform = ?', [platform]);
      
      return true;
    } catch (error) {
      console.error(`Fehler beim Entfernen der Plattform ${platform}:`, error);
      return false;
    }
  }

  /**
   * Gibt alle verfügbaren Social Media Plattformen zurück
   */
  public getAvailablePlatforms(): SocialMediaPlatform[] {
    return Array.from(this.configs.keys());
  }

  /**
   * Gibt alle aktiven Social Media Adapter zurück
   */
  public getActiveAdapters(): Map<SocialMediaPlatform, BaseSocialAdapter> {
    return this.adapters;
  }

  /**
   * Gibt einen spezifischen Social Media Adapter zurück
   */
  public getAdapter(platform: SocialMediaPlatform): BaseSocialAdapter | null {
    return this.adapters.get(platform) || null;
  }

  /**
   * Gibt die Konfiguration für eine Plattform zurück
   */
  public getConfig(platform: SocialMediaPlatform): SocialMediaConfig | null {
    return this.configs.get(platform) || null;
  }

  /**
   * Gibt alle Konfigurationen zurück
   */
  public getAllConfigs(): SocialMediaConfig[] {
    return Array.from(this.configs.values());
  }

  /**
   * Veröffentlicht einen Beitrag auf einer bestimmten Plattform
   */
  public async publishPost(platform: SocialMediaPlatform, post: SocialMediaPost): Promise<SocialMediaPost | null> {
    const adapter = this.getAdapter(platform);
    
    if (!adapter) {
      console.error(`Kein Adapter für ${platform} gefunden`);
      return null;
    }
    
    try {
      const publishedPost = await adapter.publishPost(post);
      
      // Speichere den Beitrag in der Datenbank
      await this.savePostToDb(publishedPost);
      
      return publishedPost;
    } catch (error) {
      console.error(`Fehler beim Veröffentlichen auf ${platform}:`, error);
      return null;
    }
  }

  /**
   * Speichert einen Beitrag in der Datenbank
   */
  private async savePostToDb(post: SocialMediaPost): Promise<boolean> {
    try {
      // Hier würden wir den Beitrag in der Datenbank speichern
      // In einer realen Implementierung:
      /*
      await db.run(`
        INSERT OR REPLACE INTO social_media_posts
        (id, platform, job_id, content, image_url, link, status, scheduled_date, published_date, stats, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        post.id,
        post.platform,
        post.jobId,
        post.content,
        post.imageUrl || null,
        post.link,
        post.status,
        post.scheduledDate || null,
        post.publishedDate || null,
        JSON.stringify(post.stats || {}),
        JSON.stringify(post.metadata || {})
      ]);
      */
      
      return true;
    } catch (error) {
      console.error('Fehler beim Speichern des Social Media Beitrags:', error);
      return false;
    }
  }

  /**
   * Veröffentlicht eine Stellenanzeige auf allen aktiven Plattformen
   */
  public async publishJobToAllPlatforms(
    jobId: string,
    jobTitle: string,
    companyName: string,
    location: string,
    description: string,
    applyUrl: string,
    imageUrl?: string
  ): Promise<Map<SocialMediaPlatform, SocialMediaPost | null>> {
    const results = new Map<SocialMediaPlatform, SocialMediaPost | null>();
    
    // Für jede aktive Plattform
    for (const entry of Array.from(this.adapters.entries())) {
      const [platform, adapter] = entry;
      try {
        const config = this.configs.get(platform);
        
        // Wenn die Plattform autoPost aktiviert hat oder es sich um einen manuellen Aufruf handelt
        if (config?.settings.autoPost) {
          // Erstelle einen Beitrag für die Stellenanzeige
          const post = await adapter.createJobPost(
            jobId,
            jobTitle,
            companyName,
            location,
            description,
            applyUrl,
            imageUrl
          );
          
          // Speichere den Beitrag in der Datenbank
          await this.savePostToDb(post);
          
          results.set(platform, post);
        } else {
          results.set(platform, null);
        }
      } catch (error) {
        console.error(`Fehler beim Veröffentlichen auf ${platform}:`, error);
        results.set(platform, null);
      }
    }
    
    return results;
  }
  
  /**
   * Sucht nach Kandidaten auf einer bestimmten Plattform
   */
  public async searchCandidates(platform: SocialMediaPlatform, params: SocialMediaSearchParams): Promise<SocialMediaSearchResult | null> {
    const adapter = this.getAdapter(platform);
    
    if (!adapter) {
      console.error(`Kein Adapter für ${platform} gefunden`);
      return null;
    }
    
    try {
      return await adapter.searchCandidates(params);
    } catch (error) {
      console.error(`Fehler bei der Kandidatensuche auf ${platform}:`, error);
      return null;
    }
  }
  
  /**
   * Importiert Verbindungen als Kandidaten
   */
  public async importConnectionsAsCandidates(
    platform: SocialMediaPlatform, 
    skills?: string[],
    jobTitles?: string[]
  ): Promise<{ imported: number; skipped: number; errors: number } | null> {
    const adapter = this.getAdapter(platform);
    
    if (!adapter) {
      console.error(`Kein Adapter für ${platform} gefunden`);
      return null;
    }
    
    try {
      return await adapter.importConnectionsAsCandidates(skills, jobTitles);
    } catch (error) {
      console.error(`Fehler beim Importieren der Verbindungen von ${platform}:`, error);
      return null;
    }
  }
  
  /**
   * Ruft Analysen für alle aktiven Plattformen ab
   */
  public async getAnalyticsForAllPlatforms(
    startDate: Date,
    endDate: Date,
    period: 'day' | 'week' | 'month' | 'year'
  ): Promise<Map<SocialMediaPlatform, SocialMediaAnalytics[]>> {
    const results = new Map<SocialMediaPlatform, SocialMediaAnalytics[]>();
    
    // Für jede aktive Plattform
    for (const entry of Array.from(this.adapters.entries())) {
      const [platform, adapter] = entry;
      try {
        const analytics = await adapter.getAnalytics(startDate, endDate, period);
        results.set(platform, analytics);
      } catch (error) {
        console.error(`Fehler beim Abrufen der Analysen für ${platform}:`, error);
        results.set(platform, []);
      }
    }
    
    return results;
  }
}

// Exportiere eine Singleton-Instanz des SocialMediaService
export const socialMediaService = SocialMediaService.getInstance();
