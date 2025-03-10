import { getDb } from '@/lib/db';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { MovidoLoginResponse, MovidoSession } from '@/types/movidoAutomation';
import { AES, enc } from 'crypto-js';

/**
 * Modul für die Authentifizierung bei Movido
 * Verwaltet Login, Sessions und Token-Refresh
 */
export class MovidoAuthModule {
  private readonly apiBaseUrl = 'https://api.movido.com/v2';
  private readonly encryptionKey = process.env.ENCRYPTION_KEY || 'movido-automation-key';
  
  /**
   * Verschlüsselt sensitive Daten
   * @param data Zu verschlüsselnde Daten
   * @returns Verschlüsselte Daten
   */
  private encrypt(data: string): string {
    return AES.encrypt(data, this.encryptionKey).toString();
  }
  
  /**
   * Entschlüsselt sensitive Daten
   * @param encryptedData Verschlüsselte Daten
   * @returns Entschlüsselte Daten
   */
  private decrypt(encryptedData: string): string {
    return AES.decrypt(encryptedData, this.encryptionKey).toString(enc.Utf8);
  }
  
  /**
   * Führt den Login bei Movido durch
   * @param username Benutzername
   * @param password Passwort
   * @returns Login-Antwort mit Token und Ablaufdatum
   */
  public async login(username: string, password: string): Promise<MovidoLoginResponse> {
    try {
      // In einer realen Implementierung würde hier die Movido-API aufgerufen werden
      // Simuliere API-Aufruf für das Beispiel
      // const response = await axios.post(
      //   `${this.apiBaseUrl}/auth/login`,
      //   { username, password },
      //   { headers: { 'Content-Type': 'application/json' } }
      // );
      
      // Für Demozwecke simulieren wir eine erfolgreiche Login-Antwort
      const mockLoginResponse: MovidoLoginResponse = {
        token: `mock-token-${Date.now()}`,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 Stunden gültig
        userId: 'mock-user-id',
        companyId: 'mock-company-id'
      };
      
      // Speichere Session-Informationen in der Datenbank
      await this.saveSession(mockLoginResponse);
      
      return mockLoginResponse;
    } catch (error) {
      console.error('Fehler beim Login bei Movido:', error);
      throw new Error('Login bei Movido fehlgeschlagen');
    }
  }
  
  /**
   * Speichert eine aktive Session in der Datenbank
   * @param loginResponse Login-Antwort von Movido
   */
  private async saveSession(loginResponse: MovidoLoginResponse): Promise<void> {
    const db = await getDb();
    const sessionId = uuidv4();
    
    try {
      // Bestehende Sessions für diesen Benutzer löschen
      await db.run('DELETE FROM movido_sessions WHERE 1');
      
      // Neue Session speichern
      await db.run(
        `INSERT INTO movido_sessions (id, session_token, expires_at, last_used_at, created_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          sessionId,
          this.encrypt(loginResponse.token), // Token verschlüsseln
          loginResponse.expiresAt,
          new Date().toISOString()
        ]
      );
    } catch (error) {
      console.error('Fehler beim Speichern der Movido-Session:', error);
      throw error;
    }
  }
  
  /**
   * Prüft, ob eine gültige Session existiert
   * @returns true, wenn eine aktive Session existiert
   */
  public async hasValidSession(): Promise<boolean> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    try {
      const session = await db.get(
        'SELECT * FROM movido_sessions WHERE expires_at > ? ORDER BY created_at DESC LIMIT 1',
        [now]
      );
      
      return !!session;
    } catch (error) {
      console.error('Fehler beim Prüfen der Movido-Session:', error);
      return false;
    }
  }
  
  /**
   * Holt den aktuellen Session-Token
   * @returns Token oder null, wenn keine gültige Session existiert
   */
  public async getSessionToken(): Promise<string | null> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    try {
      const session = await db.get(
        'SELECT * FROM movido_sessions WHERE expires_at > ? ORDER BY created_at DESC LIMIT 1',
        [now]
      ) as MovidoSession | null;
      
      if (!session) return null;
      
      // Session als verwendet markieren
      await db.run(
        'UPDATE movido_sessions SET last_used_at = ? WHERE id = ?',
        [now, session.id]
      );
      
      // Token entschlüsseln und zurückgeben
      return this.decrypt(session.sessionToken);
    } catch (error) {
      console.error('Fehler beim Abrufen des Movido-Session-Tokens:', error);
      return null;
    }
  }
  
  /**
   * Löscht alle gespeicherten Sessions
   */
  public async clearSessions(): Promise<void> {
    const db = await getDb();
    
    try {
      await db.run('DELETE FROM movido_sessions WHERE 1');
    } catch (error) {
      console.error('Fehler beim Löschen der Movido-Sessions:', error);
      throw error;
    }
  }
  
  /**
   * Holt ein API-Token (mit Auto-Login, falls erforderlich)
   * @param config Konfiguration (mit Zugangsdaten)
   * @returns Token oder null, wenn die Authentifizierung fehlschlägt
   */
  public async getApiToken(config: { apiKey: string; apiSecret: string }): Promise<string | null> {
    // Prüfe zunächst, ob eine gültige Session existiert
    if (await this.hasValidSession()) {
      const token = await this.getSessionToken();
      if (token) return token;
    }
    
    // Wenn keine gültige Session existiert oder der Token nicht abgerufen werden konnte,
    // automatisch einloggen
    try {
      const loginResponse = await this.login(config.apiKey, config.apiSecret);
      return loginResponse.token;
    } catch (error) {
      console.error('Fehler beim automatischen Login bei Movido:', error);
      return null;
    }
  }
  
  /**
   * Holt die aktuelle Konfiguration für die Movido-Authentifizierung
   * @returns Konfiguration oder null, wenn keine existiert
   */
  public async getAuthConfig(): Promise<{ apiKey: string; apiSecret: string } | null> {
    const db = await getDb();
    
    try {
      const config = await db.get('SELECT api_key, api_secret FROM movido_configurations LIMIT 1');
      
      if (!config) return null;
      
      return {
        apiKey: config.api_key,
        apiSecret: config.api_secret
      };
    } catch (error) {
      console.error('Fehler beim Abrufen der Movido-Auth-Konfiguration:', error);
      return null;
    }
  }

  /**
   * Testet die Verbindung zu Movido mit den übergebenen Zugangsdaten
   * @param config Konfiguration mit Zugangsdaten
   * @returns Ergebnis des Tests
   */
  public async testConnection(config: { 
    apiKey: string; 
    apiSecret: string; 
    companyId: string;
    autoLoginEnabled?: boolean;
    sessionTimeoutMinutes?: number;
  }): Promise<{ success: boolean; errorMessage?: string }> {
    try {
      // Versuche einen Login mit den übergebenen Zugangsdaten
      await this.login(config.apiKey, config.apiSecret);
      
      // Wenn der Login erfolgreich war, sollte eine gültige Session existieren
      const isValid = await this.hasValidSession();
      
      if (isValid) {
        return { success: true };
      } else {
        return { 
          success: false, 
          errorMessage: 'Verbindungstest fehlgeschlagen: Keine gültige Session nach dem Login' 
        };
      }
    } catch (error) {
      console.error('Fehler beim Testen der Verbindung zu Movido:', error);
      return { 
        success: false, 
        errorMessage: error instanceof Error 
          ? `Verbindungstest fehlgeschlagen: ${error.message}` 
          : 'Verbindungstest fehlgeschlagen: Unbekannter Fehler' 
      };
    }
  }
}
