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
 * Basis-Adapter für alle Social Media Plattformen
 * Definiert die grundlegende Schnittstelle, die von allen spezifischen
 * Social Media-Adaptern implementiert werden muss
 */
export abstract class BaseSocialAdapter {
  protected config: SocialMediaConfig;
  protected accessToken: string | null = null;
  protected refreshToken: string | null = null;
  protected tokenExpiry: Date | null = null;
  protected isAuthenticated = false;
  protected platform: SocialMediaPlatform;

  constructor(config: SocialMediaConfig) {
    this.config = config;
    this.platform = config.platform;
  }

  /**
   * Stellt eine Verbindung zur Social Media API her
   * und authentifiziert den Benutzer
   */
  abstract authenticate(): Promise<boolean>;

  /**
   * Aktualisiert den Access Token mit dem Refresh Token
   */
  abstract refreshAccessToken(): Promise<boolean>;

  /**
   * Prüft, ob die Authentifizierung noch gültig ist
   */
  isAuthValid(): boolean {
    if (!this.accessToken || !this.tokenExpiry) {
      return false;
    }
    
    // Prüfe, ob Token innerhalb der nächsten 5 Minuten abläuft
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    
    return this.tokenExpiry > fiveMinutesFromNow;
  }

  /**
   * Veröffentlicht einen Beitrag auf der Social Media Plattform
   */
  abstract publishPost(post: SocialMediaPost): Promise<SocialMediaPost>;

  /**
   * Plant einen Beitrag für die zukünftige Veröffentlichung
   */
  abstract schedulePost(post: SocialMediaPost, scheduledDate: Date): Promise<SocialMediaPost>;

  /**
   * Aktualisiert einen bestehenden Beitrag
   */
  abstract updatePost(postId: string, updates: Partial<SocialMediaPost>): Promise<SocialMediaPost>;

  /**
   * Löscht einen Beitrag
   */
  abstract deletePost(postId: string): Promise<boolean>;

  /**
   * Ruft den aktuellen Status eines Beitrags ab
   */
  abstract getPostStatus(postId: string): Promise<SocialMediaPost>;

  /**
   * Ruft eine Liste von Beiträgen ab
   */
  abstract getPosts(limit?: number, offset?: number): Promise<SocialMediaPost[]>;

  /**
   * Ruft das verbundene Profil ab
   */
  abstract getProfile(): Promise<SocialMediaProfile>;

  /**
   * Ruft eine Liste von Verbindungen ab
   */
  abstract getConnections(limit?: number, offset?: number): Promise<SocialMediaConnection[]>;

  /**
   * Sucht nach potenziellen Kandidaten basierend auf den Suchkriterien
   */
  abstract searchCandidates(params: SocialMediaSearchParams): Promise<SocialMediaSearchResult>;

  /**
   * Sendet eine Verbindungsanfrage an einen potenziellen Kandidaten
   */
  abstract sendConnectionRequest(profileId: string, message?: string): Promise<boolean>;

  /**
   * Sendet eine Nachricht an eine Verbindung
   */
  abstract sendMessage(profileId: string, message: string): Promise<boolean>;

  /**
   * Ruft Analysen und Statistiken ab
   */
  abstract getAnalytics(startDate: Date, endDate: Date, period: 'day' | 'week' | 'month' | 'year'): Promise<SocialMediaAnalytics[]>;

  /**
   * Überprüft, ob die Verbindung zur API hergestellt werden kann
   */
  async testConnection(): Promise<boolean> {
    try {
      const isAuth = await this.authenticate();
      if (!isAuth) {
        console.error(`Konnte nicht mit ${this.platform} verbinden: Authentifizierung fehlgeschlagen`);
        return false;
      }
      
      // Versuche, das Profil abzurufen, um die Verbindung zu testen
      await this.getProfile();
      return true;
    } catch (error) {
      console.error(`Konnte nicht mit ${this.platform} verbinden:`, error);
      return false;
    }
  }

  /**
   * Erstellt einen Beitrag aus einer Stellenanzeige
   */
  async createJobPost(jobId: string, jobTitle: string, companyName: string, location: string, description: string, applyUrl: string, imageUrl?: string): Promise<SocialMediaPost> {
    // Erzeuge einen Standardbeitrag für eine Stellenanzeige
    // Kann von spezifischen Adaptern überschrieben werden, um plattformspezifische Formatierungen anzuwenden
    
    let content = '';
    
    // Verwende die benutzerdefinierte Vorlage, falls vorhanden
    if (this.config.settings.postTemplate) {
      content = this.config.settings.postTemplate
        .replace(/{{jobTitle}}/g, jobTitle)
        .replace(/{{companyName}}/g, companyName)
        .replace(/{{location}}/g, location)
        .replace(/{{description}}/g, description.substring(0, 300) + (description.length > 300 ? '...' : ''))
        .replace(/{{applyUrl}}/g, applyUrl);
    } else {
      // Standardvorlage
      content = `${companyName} sucht: ${jobTitle} in ${location}\n\n`;
      content += `${description.substring(0, 300)}${description.length > 300 ? '...' : ''}\n\n`;
      content += `Jetzt bewerben: ${applyUrl}`;
    }
    
    // Erstelle den Post
    const post: SocialMediaPost = {
      platform: this.platform,
      jobId,
      content,
      link: applyUrl,
      imageUrl,
      status: 'draft'
    };
    
    // Wenn automatisches Posten aktiviert ist, veröffentliche den Beitrag sofort
    if (this.config.settings.autoPost) {
      return await this.publishPost(post);
    }
    
    return post;
  }
  
  /**
   * Importiert Kontakte/Verbindungen als potenzielle Kandidaten
   */
  abstract importConnectionsAsCandidates(skills?: string[], jobTitles?: string[]): Promise<{
    imported: number;
    skipped: number;
    errors: number;
  }>;
}
