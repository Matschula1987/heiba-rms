import axios from 'axios';
import { 
  PhoneConfiguration, 
  CallLog
} from '../PhoneService';

/**
 * Adapter-Klasse für ProCall Telefonanlagen-Integration
 * 
 * Diese Klasse bietet eine Integration mit der ProCall API zur Steuerung 
 * der Telefonanlage und für Click-to-Call-Funktionalität.
 */
export class ProCallAdapter {
  private apiUrl: string;
  private apiKey: string;
  private username: string;
  private password: string;
  private extension: string;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: PhoneConfiguration) {
    if (!config.serverUrl) {
      throw new Error('ProCall API-URL ist erforderlich');
    }
    
    if (!config.apiKey) {
      throw new Error('ProCall API-Schlüssel ist erforderlich');
    }
    
    if (!config.username || !config.password) {
      throw new Error('ProCall Benutzername und Passwort sind erforderlich');
    }
    
    if (!config.extension) {
      throw new Error('ProCall Durchwahl ist erforderlich');
    }
    
    this.apiUrl = config.serverUrl;
    this.apiKey = config.apiKey;
    this.username = config.username;
    this.password = config.password;
    this.extension = config.extension;
  }

  /**
   * Authentifiziert sich bei der ProCall API und holt ein Access-Token
   * @returns Access-Token
   */
  private async authenticate(): Promise<string> {
    // Prüfe, ob ein gültiges Token vorhanden ist
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken as string;
    }
    
    try {
      const response = await axios.post(`${this.apiUrl}/auth`, {
        apiKey: this.apiKey,
        username: this.username,
        password: this.password
      });
      
      if (response.data && response.data.accessToken) {
        this.accessToken = response.data.accessToken;
        
        // Token-Ablaufzeit auf 1 Stunde setzen (oder gemäß API-Dokumentation)
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);
        this.tokenExpiry = expiryDate;
        
        return this.accessToken as string;
      } else {
        throw new Error('Authentifizierung bei ProCall fehlgeschlagen');
      }
    } catch (error) {
      console.error('Fehler bei der Authentifizierung:', error);
      throw new Error('Authentifizierung bei ProCall fehlgeschlagen');
    }
  }

  /**
   * Initiiert einen Anruf über ProCall (Click-to-Call)
   * @param phoneNumber Die zu wählende Telefonnummer
   * @param userId Optional: Benutzer-ID des Anrufers
   * @returns ID des Anrufs
   */
  public async initiateCall(phoneNumber: string, userId?: string): Promise<string> {
    const token = await this.authenticate();
    
    try {
      const response = await axios.post(`${this.apiUrl}/calls`, {
        extension: this.extension,
        number: phoneNumber,
        userId: userId || this.username
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.callId) {
        return response.data.callId;
      } else {
        throw new Error('Anruf konnte nicht initiiert werden');
      }
    } catch (error) {
      console.error('Fehler beim Initiieren des Anrufs:', error);
      throw new Error('Anruf konnte nicht initiiert werden');
    }
  }

  /**
   * Beendet einen aktiven Anruf
   * @param callId ID des Anrufs
   * @returns true, wenn erfolgreich
   */
  public async endCall(callId: string): Promise<boolean> {
    const token = await this.authenticate();
    
    try {
      const response = await axios.post(`${this.apiUrl}/calls/${callId}/end`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('Fehler beim Beenden des Anrufs:', error);
      throw new Error('Anruf konnte nicht beendet werden');
    }
  }

  /**
   * Holt den Status eines Anrufs
   * @param callId ID des Anrufs
   * @returns Status des Anrufs
   */
  public async getCallStatus(callId: string): Promise<string> {
    const token = await this.authenticate();
    
    try {
      const response = await axios.get(`${this.apiUrl}/calls/${callId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.status) {
        return response.data.status;
      } else {
        throw new Error('Anrufstatus konnte nicht abgerufen werden');
      }
    } catch (error) {
      console.error('Fehler beim Abrufen des Anrufstatus:', error);
      throw new Error('Anrufstatus konnte nicht abgerufen werden');
    }
  }

  /**
   * Holt die Anrufliste für eine Durchwahl
   * @param limit Maximale Anzahl der abzurufenden Anrufe
   * @param skip Anzahl der zu überspringenden Anrufe
   * @returns Array mit Anrufprotokollen
   */
  public async getCallHistory(limit: number = 50, skip: number = 0): Promise<CallLog[]> {
    const token = await this.authenticate();
    
    try {
      const response = await axios.get(`${this.apiUrl}/calls/history`, {
        params: {
          extension: this.extension,
          limit,
          skip
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        return response.data.map((call: any) => this.mapProCallToCallLog(call));
      } else {
        throw new Error('Anrufliste konnte nicht abgerufen werden');
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Anrufliste:', error);
      throw new Error('Anrufliste konnte nicht abgerufen werden');
    }
  }

  /**
   * Konvertiert ein ProCall-Anrufobjekt in ein CallLog-Objekt
   */
  private mapProCallToCallLog(call: any): CallLog {
    // Bestimme den Anruftyp
    let callType: 'incoming' | 'outgoing' | 'missed' = 'missed';
    
    if (call.direction === 'incoming') {
      callType = call.answered ? 'incoming' : 'missed';
    } else {
      callType = 'outgoing';
    }
    
    // Bestimme den Status
    let status: 'connected' | 'no_answer' | 'busy' | 'failed' = 'failed';
    
    if (call.answered) {
      status = 'connected';
    } else if (call.busy) {
      status = 'busy';
    } else {
      status = 'no_answer';
    }
    
    // Berechne die Dauer
    let duration: number | undefined;
    
    if (call.startTime && call.endTime) {
      const start = new Date(call.startTime).getTime();
      const end = new Date(call.endTime).getTime();
      duration = Math.round((end - start) / 1000);
    }
    
    return {
      phoneConfigurationId: '',  // wird vom Service gesetzt
      externalId: call.id,
      callType,
      callerNumber: call.callerNumber,
      callerName: call.callerName,
      recipientNumber: call.recipientNumber,
      recipientName: call.recipientName,
      extension: call.extension || this.extension,
      startTime: call.startTime,
      endTime: call.endTime,
      duration,
      status,
      recordingUrl: call.recordingUrl,
      notes: call.notes
    };
  }
}
