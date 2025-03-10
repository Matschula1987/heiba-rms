import { Job } from '@/types/jobs';
import { getDb } from '@/lib/db';
import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';

// Erweiterung des Job-Typs für RSSFeedManager
interface RSSJob extends Job {
  external_application_url?: string;
}

/**
 * Format-Template für einen RSS-Feed
 */
export interface RSSFormatTemplate {
  // Selektoren zum Finden der Elemente im Feed
  itemSelector: string;               // Selektor für Feed-Items (z.B. 'item' oder 'entry')
  titleSelector: string;              // Selektor für den Titel (z.B. 'title')
  descriptionSelector: string;        // Selektor für die Beschreibung (z.B. 'description' oder 'summary')
  linkSelector: string;               // Selektor für den Link (z.B. 'link')
  pubDateSelector: string;            // Selektor für das Veröffentlichungsdatum (z.B. 'pubDate')
  guidSelector: string;               // Selektor für die GUID (z.B. 'guid')

  // Optionale Selektoren für spezifische Felder
  companySelector?: string;           // Selektor für das Unternehmen
  locationSelector?: string;          // Selektor für den Standort
  salarySelector?: string;            // Selektor für das Gehalt
  jobTypeSelector?: string;           // Selektor für die Arbeitszeit
  requirementsSelector?: string;      // Selektor für die Anforderungen

  // Transformationsfunktionen
  transformers?: {
    title?: (value: string) => string;
    description?: (value: string) => string;
    company?: (value: string) => string;
    location?: (value: string) => string;
    salary?: (value: string) => string;
    jobType?: (value: string) => string;
    requirements?: (value: string) => string;
    pubDate?: (value: string) => string;
  };

  // Standard-Werte für Felder, die nicht im Feed vorhanden sind
  defaults?: {
    company?: string;
    location?: string;
    jobType?: string;
  };
}

/**
 * Quelle eines RSS-Feeds
 */
export interface RSSFeedSource {
  id: string;
  name: string;
  url: string;
  category?: string;
  sourceType: string;
  formatTemplate?: string;  // JSON-String mit Template
  active: boolean;
  updateInterval: number;
  lastUpdate?: string;
  errorCount: number;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Manager für RSS-Feeds
 * Verantwortlich für das Import und Export von Jobs über RSS-Feeds
 */
export class RSSFeedManager {
  private xmlParser: XMLParser;
  private formatTemplates: Record<string, RSSFormatTemplate>;
  
  constructor() {
    // Initialisiere den XML-Parser
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      isArray: (name: string, jpath: string) => {
        // Diese Elemente sollten immer als Array behandelt werden
        if (name === 'item' || name === 'entry') return true;
        return false;
      }
    });
    
    // Vorinitialisierte Format-Templates
    this.formatTemplates = {
      // Standard RSS-Format
      'generic': {
        itemSelector: 'item',
        titleSelector: 'title',
        descriptionSelector: 'description',
        linkSelector: 'link',
        pubDateSelector: 'pubDate',
        guidSelector: 'guid',
        defaults: {
          company: 'Unbekanntes Unternehmen',
          jobType: 'Vollzeit'
        }
      },
      
      // Arbeitsagentur-Format
      'arbeitsagentur': {
        itemSelector: 'item',
        titleSelector: 'title',
        descriptionSelector: 'description',
        linkSelector: 'link',
        pubDateSelector: 'pubDate',
        guidSelector: 'guid',
        // Spezifische Selektoren für Arbeitsagentur
        companySelector: 'author',
        locationSelector: 'category',
        transformers: {
          // Extrahiere Unternehmen aus der Beschreibung
          company: (value: string) => {
            const match = value.match(/Arbeitgeber: ([^,]+)/);
            return match ? match[1].trim() : 'Bundesagentur für Arbeit';
          },
          // Extrahiere Standort aus der Kategorie oder Beschreibung
          location: (value: string) => {
            if (value.includes(',')) {
              return value.trim();
            }
            const match = value.match(/Einsatzort: ([^,]+)/);
            return match ? match[1].trim() : 'Deutschland';
          },
          // Extrahiere Job-Typ aus der Beschreibung
          jobType: (value: string) => {
            const match = value.match(/Arbeitszeitmodell: ([^.]+)/);
            return match ? match[1].trim() : 'Vollzeit';
          }
        },
        defaults: {
          company: 'Bundesagentur für Arbeit',
          location: 'Deutschland',
          jobType: 'Vollzeit'
        }
      },
      
      // GitHub Jobs Format (Atom)
      'github': {
        itemSelector: 'entry',
        titleSelector: 'title',
        descriptionSelector: 'content',
        linkSelector: 'link',
        pubDateSelector: 'published',
        guidSelector: 'id',
        companySelector: 'author.name',
        transformers: {
          // Extrahiere Standort aus dem Titel
          location: (value: string) => {
            const match = value.match(/\(([^)]+)\)$/);
            return match ? match[1].trim() : 'Remote';
          },
          // Konvertiere das Datum
          pubDate: (value: string) => {
            return new Date(value).toISOString();
          }
        },
        defaults: {
          jobType: 'Vollzeit'
        }
      }
    };
  }
  
  /**
   * Lädt alle aktiven Feed-Quellen aus der Datenbank
   * @returns Array mit allen aktiven Feed-Quellen
   */
  public async getActiveFeedSources(): Promise<RSSFeedSource[]> {
    const db = await getDb();
    const sources = await db.all('SELECT * FROM rss_feed_sources WHERE active = 1');
    return sources;
  }
  
  /**
   * Fügt eine neue Feed-Quelle hinzu
   * @param source Feed-Quelle
   * @returns ID der neuen Feed-Quelle
   */
  public async addFeedSource(source: Omit<RSSFeedSource, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    const result = await db.run(`
      INSERT INTO rss_feed_sources (
        name, url, category, source_type, format_template, active, update_interval, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      source.name,
      source.url,
      source.category || null,
      source.sourceType,
      source.formatTemplate || null,
      source.active ? 1 : 0,
      source.updateInterval,
      now,
      now
    ]);
    
    // Hole die ID der eingefügten Quelle
    const inserted = await db.get('SELECT id FROM rss_feed_sources ORDER BY rowid DESC LIMIT 1');
    return inserted.id;
  }
  
  /**
   * Aktualisiert eine bestehende Feed-Quelle
   * @param id ID der Feed-Quelle
   * @param source Aktualisierte Feed-Quelle
   * @returns true, wenn erfolgreich
   */
  public async updateFeedSource(id: string, source: Partial<RSSFeedSource>): Promise<boolean> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    // Baue die SQL-Abfrage dynamisch
    const updates = [];
    const params = [];
    
    // Füge nur die Felder hinzu, die aktualisiert werden sollen
    if (source.name !== undefined) {
      updates.push('name = ?');
      params.push(source.name);
    }
    if (source.url !== undefined) {
      updates.push('url = ?');
      params.push(source.url);
    }
    if (source.category !== undefined) {
      updates.push('category = ?');
      params.push(source.category || null);
    }
    if (source.sourceType !== undefined) {
      updates.push('source_type = ?');
      params.push(source.sourceType);
    }
    if (source.formatTemplate !== undefined) {
      updates.push('format_template = ?');
      params.push(source.formatTemplate || null);
    }
    if (source.active !== undefined) {
      updates.push('active = ?');
      params.push(source.active ? 1 : 0);
    }
    if (source.updateInterval !== undefined) {
      updates.push('update_interval = ?');
      params.push(source.updateInterval);
    }
    if (source.lastUpdate !== undefined) {
      updates.push('last_update = ?');
      params.push(source.lastUpdate);
    }
    if (source.errorCount !== undefined) {
      updates.push('error_count = ?');
      params.push(source.errorCount);
    }
    if (source.lastError !== undefined) {
      updates.push('last_error = ?');
      params.push(source.lastError);
    }
    
    // Immer das updated_at-Feld aktualisieren
    updates.push('updated_at = ?');
    params.push(now);
    
    // ID für die WHERE-Klausel
    params.push(id);
    
    // Führe die Aktualisierung durch
    const result = await db.run(`
      UPDATE rss_feed_sources
      SET ${updates.join(', ')}
      WHERE id = ?
    `, params);
    
    return result.changes > 0;
  }
  
  /**
   * Löscht eine Feed-Quelle
   * @param id ID der Feed-Quelle
   * @returns true, wenn erfolgreich
   */
  public async deleteFeedSource(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.run('DELETE FROM rss_feed_sources WHERE id = ?', [id]);
    return result.changes > 0;
  }
  
  /**
   * Führt einen Import aus allen aktiven Feed-Quellen durch
   * @returns Anzahl der importierten Jobs
   */
  public async importFromAllSources(): Promise<number> {
    const sources = await this.getActiveFeedSources();
    let importedCount = 0;
    
    for (const source of sources) {
      try {
        // Prüfe, ob ein Update erforderlich ist
        if (source.lastUpdate) {
          const lastUpdate = new Date(source.lastUpdate);
          const now = new Date();
          const minutesSinceLastUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
          
          if (minutesSinceLastUpdate < source.updateInterval) {
            console.log(`Überspringe Feed ${source.name}: Letztes Update vor ${Math.round(minutesSinceLastUpdate)} Minuten (Intervall: ${source.updateInterval} Minuten)`);
            continue;
          }
        }
        
        // Führe den Import durch
        const importedJobs = await this.importFromSource(source);
        importedCount += importedJobs.length;
        
        // Aktualisiere den Zeitpunkt des letzten Updates
        await this.updateFeedSource(source.id, {
          lastUpdate: new Date().toISOString(),
          errorCount: 0,
          lastError: undefined
        });
      } catch (error) {
        console.error(`Fehler beim Import aus ${source.name}:`, error);
        
        // Aktualisiere den Fehlerzähler
        await this.updateFeedSource(source.id, {
          errorCount: (source.errorCount || 0) + 1,
          lastError: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return importedCount;
  }
  
  /**
   * Führt einen Import aus einer bestimmten Feed-Quelle durch
   * @param source Feed-Quelle
   * @returns Array mit importierten Jobs
   */
  public async importFromSource(source: RSSFeedSource): Promise<RSSJob[]> {
    try {
      // Hole den Feed-Inhalt
      const response = await axios.get(source.url);
      const feedContent = response.data;
      
      // Parse den Feed mit dem entsprechenden Template
      const jobs = await this.parseFeed(feedContent, source);
      
      // Speichere die importierten Jobs in der Datenbank
      await this.saveImportedJobs(jobs, source.id);
      
      return jobs;
    } catch (error) {
      console.error(`Fehler beim Import aus ${source.name}:`, error);
      throw error;
    }
  }
  
  /**
   * Parst einen RSS-Feed und konvertiert die Einträge in Job-Objekte
   * @param feedContent Inhalt des RSS-Feeds als String
   * @param source Feed-Quelle
   * @returns Array mit Job-Objekten
   */
  private async parseFeed(feedContent: string, source: RSSFeedSource): Promise<RSSJob[]> {
    // Parse XML in JavaScript-Objekt
    const parsedData = this.xmlParser.parse(feedContent);
    
    // Lade das Format-Template
    let formatTemplate: RSSFormatTemplate;
    
    if (source.formatTemplate) {
      // Benutzerdefiniertes Template aus der Datenbank
      try {
        formatTemplate = JSON.parse(source.formatTemplate);
      } catch (error) {
        console.error(`Fehler beim Parsen des Format-Templates für ${source.name}:`, error);
        formatTemplate = this.formatTemplates['generic'];
      }
    } else {
      // Vordefiniertes Template basierend auf dem Quelltyp
      formatTemplate = this.formatTemplates[source.sourceType] || this.formatTemplates['generic'];
    }
    
    // Automatische Feed-Format-Erkennung
    if (!formatTemplate) {
      formatTemplate = this.detectFeedFormat(parsedData);
    }
    
    // Extrahiere die Items aus dem Feed
    let items = this.extractItems(parsedData, formatTemplate.itemSelector);
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.warn(`Keine Items im Feed gefunden: ${source.name}`);
      return [];
    }
    
    // Konvertiere die Items in Job-Objekte
    const jobs: RSSJob[] = [];
    
    for (const item of items) {
      try {
        const job = this.convertItemToJob(item, formatTemplate, source);
        jobs.push(job);
      } catch (error) {
        console.error(`Fehler beim Konvertieren eines Items in ${source.name}:`, error);
      }
    }
    
    return jobs;
  }
  
  /**
   * Speichert importierte Jobs in der Datenbank
   * @param jobs Array mit Job-Objekten
   * @param sourceId ID der Feed-Quelle
   */
  private async saveImportedJobs(jobs: RSSJob[], sourceId: string): Promise<void> {
    const db = await getDb();
    const now = new Date().toISOString();
    
    for (const job of jobs) {
      try {
        // Prüfe, ob der Job bereits importiert wurde
        const externalId = job.external_job_id;
        const existing = await db.get(
          'SELECT * FROM rss_imported_jobs WHERE feed_source_id = ? AND external_id = ?',
          [sourceId, externalId]
        );
        
        if (existing) {
          // Job bereits importiert, überspringe
          continue;
        }
        
        // Füge den Job in die jobs-Tabelle ein
        const jobResult = await db.run(`
          INSERT INTO jobs (
            title, description, rich_description, company, location, salary_range, job_type, 
            requirements, external_job_id, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          job.title,
          job.description,
          job.rich_description || null,
          job.company,
          job.location,
          job.salary_range || null,
          job.job_type,
          job.requirements || null,
          job.external_job_id,
          'draft',  // Immer als Entwurf importieren
          now,
          now
        ]);
        
        // Hole die ID des eingefügten Jobs
        const insertedJob = await db.get('SELECT id FROM jobs ORDER BY rowid DESC LIMIT 1');
        const jobId = insertedJob.id;
        
        // Speichere den importierten Job in der rss_imported_jobs-Tabelle
        await db.run(`
          INSERT INTO rss_imported_jobs (
            feed_source_id, external_id, job_id, title, description, link, 
            pub_date, import_date, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          sourceId,
          externalId,
          jobId,
          job.title,
          job.description,
          job.external_application_url || '',
          job.created_at,
          now,
          'imported'
        ]);
      } catch (error) {
        console.error(`Fehler beim Speichern des Jobs in der Datenbank:`, error);
      }
    }
  }
  
  /**
   * Extrahiert Items aus einem geparsten Feed
   * @param parsedData Geparster Feed
   * @param itemSelector Selektor für Items
   * @returns Array mit Items
   */
  private extractItems(parsedData: any, itemSelector: string): any[] {
    // Behandle verschiedene Feed-Formate
    if (parsedData.rss && parsedData.rss.channel) {
      // Standard RSS 2.0
      return parsedData.rss.channel[itemSelector] || [];
    } else if (parsedData.feed) {
      // Atom
      return parsedData.feed[itemSelector] || [];
    } else if (parsedData.channel) {
      // RSS 1.0 oder anderes Format
      return parsedData.channel[itemSelector] || [];
    } else if (parsedData.RDF) {
      // RSS 1.0 (RDF)
      return parsedData.RDF.item || [];
    } else {
      // Versuche, das Item direkt zu finden
      for (const key in parsedData) {
        if (parsedData[key] && typeof parsedData[key] === 'object') {
          if (Array.isArray(parsedData[key][itemSelector])) {
            return parsedData[key][itemSelector];
          }
        }
      }
    }
    
    return [];
  }
  
  /**
   * Konvertiert ein Item aus einem Feed in ein Job-Objekt
   * @param item Item aus dem Feed
   * @param template Format-Template
   * @param source Feed-Quelle
   * @returns Job-Objekt
   */
  private convertItemToJob(item: any, template: RSSFormatTemplate, source: RSSFeedSource): RSSJob {
    // Extrahiere Werte aus dem Item mit den Selektoren aus dem Template
    let title = this.extractValue(item, template.titleSelector) || 'Unbekannter Titel';
    let description = this.extractValue(item, template.descriptionSelector) || '';
    const link = this.extractValue(item, template.linkSelector);
    const pubDate = this.extractValue(item, template.pubDateSelector);
    const guid = this.extractValue(item, template.guidSelector);
    
    // Optionale Felder
    let company = template.companySelector 
      ? this.extractValue(item, template.companySelector) 
      : (template.defaults?.company || 'Unbekanntes Unternehmen');
    
    let location = template.locationSelector 
      ? this.extractValue(item, template.locationSelector) 
      : (template.defaults?.location || 'Unbekannt');
    
    let salary = template.salarySelector 
      ? this.extractValue(item, template.salarySelector) 
      : null;
    
    let jobType = template.jobTypeSelector 
      ? this.extractValue(item, template.jobTypeSelector) 
      : (template.defaults?.jobType || 'Vollzeit');
    
    let requirements = template.requirementsSelector 
      ? this.extractValue(item, template.requirementsSelector) 
      : null;
    
    // Anwenden der Transformatoren, falls vorhanden
    if (template.transformers) {
      if (template.transformers.title && title) {
        title = template.transformers.title(title);
      }
      
      if (template.transformers.description && description) {
        description = template.transformers.description(description);
      }
      
      if (template.transformers.company && company) {
        company = template.transformers.company(company);
      } else if (template.transformers.company && !company && description) {
        // Versuche, das Unternehmen aus der Beschreibung zu extrahieren
        company = template.transformers.company(description);
      }
      
      if (template.transformers.location && location) {
        location = template.transformers.location(location);
      } else if (template.transformers.location && !location && description) {
        // Versuche, den Standort aus der Beschreibung zu extrahieren
        location = template.transformers.location(description);
      }
      
      if (template.transformers.salary && salary) {
        salary = template.transformers.salary(salary);
      }
      
      if (template.transformers.jobType && jobType) {
        jobType = template.transformers.jobType(jobType);
      } else if (template.transformers.jobType && !jobType && description) {
        // Versuche, den Job-Typ aus der Beschreibung zu extrahieren
        jobType = template.transformers.jobType(description);
      }
      
      if (template.transformers.requirements && requirements) {
        requirements = template.transformers.requirements(requirements);
      }
    }
    
    // Erstelle ein Job-Objekt
    const job: RSSJob = {
      id: `rss-${source.id}-${Date.now()}`,
      title: title,
      description: description,
      company: company || 'Unbekanntes Unternehmen',
      location: location || 'Unbekannt',
      salary_range: salary || undefined,
      job_type: jobType || 'Vollzeit',
      requirements: requirements || undefined,
      external_job_id: guid || link || `${source.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      external_application_url: link || undefined,
      status: 'draft',
      created_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Optional: Rich-Beschreibung, falls HTML enthalten ist
    if (description && description.includes('<')) {
      job.rich_description = description;
    }
    
    return job;
  }
  
  /**
   * Extrahiert einen Wert aus einem Item mit einem Selektor
   * @param item Item aus dem Feed
   * @param selector Selektor (kann verschachtelt sein, z.B. 'channel.title')
   * @returns Extrahierter Wert oder null
   */
  private extractValue(item: any, selector: string): string | null {
    if (!selector) return null;
    
    // Behandle verschachtelte Selektoren (z.B. 'author.name')
    const parts = selector.split('.');
    let value = item;
    
    for (const part of parts) {
      if (!value || typeof value !== 'object') return null;
      value = value[part];
    }
    
    // Behandle verschiedene Werttypen
    if (typeof value === 'string') {
      return value;
    } else if (value && typeof value === 'object') {
      // Für Atom-Feeds, wo Links als Objekte dargestellt werden
      if (selector === 'link' && value['@_href']) {
        return value['@_href'];
      }
      
      // Für Fälle, wo der Wert ein Objekt mit einem Textknoten ist
      if (value['#text']) {
        return value['#text'];
      }
    }
    
    return value ? String(value) : null;
  }
  
  /**
   * Erkennt automatisch das Format eines Feeds
   * @param parsedData Geparster Feed
   * @returns Format-Template
   */
  private detectFeedFormat(parsedData: any): RSSFormatTemplate {
    // Standard-Template als Fallback
    const genericTemplate = this.formatTemplates['generic'];
    
    // Prüfe auf Atom-Format
    if (parsedData.feed && parsedData.feed.entry) {
      return {
        ...genericTemplate,
        itemSelector: 'entry',
        titleSelector: 'title',
        descriptionSelector: 'content',
        linkSelector: 'link',
        pubDateSelector: 'published',
        guidSelector: 'id'
      };
    }
    
    // Prüfe auf RSS 2.0
    if (parsedData.rss && parsedData.rss.channel && parsedData.rss.channel.item) {
      return genericTemplate;
    }
    
    // Prüfe auf RSS 1.0 (RDF)
    if (parsedData.RDF && parsedData.RDF.item) {
      return {
        ...genericTemplate,
        itemSelector: 'item'
      };
    }
    
    // Prüfe auf Arbeitsagentur-Format anhand von Mustern in den Items
    if (parsedData.rss && parsedData.rss.channel && parsedData.rss.channel.item) {
      const items = parsedData.rss.channel.item;
      if (items.length > 0) {
        const firstItem = items[0];
        const description = firstItem.description ? String(firstItem.description) : '';
        
        if (description.includes('Arbeitgeber:') || description.includes('Bundesagentur')) {
          return this.formatTemplates['arbeitsagentur'];
        }
      }
    }
    
    // Fallback auf generisches Template
    return genericTemplate;
  }
  
  /**
   * Erstellt einen RSS-Feed aus aktiven Jobs
   * @returns XML-String mit dem RSS-Feed
   */
  public async createOutgoingFeed(): Promise<string> {
    const db = await getDb();
    
    // Hole die Konfiguration für den ausgehenden Feed
    const config = await db.get('SELECT * FROM rss_outgoing_feed_config LIMIT 1');
    
    if (!config || !config.enabled) {
      throw new Error('Ausgehender RSS-Feed ist nicht konfiguriert oder deaktiviert.');
    }
    
    // Hole die Jobs, die im Feed enthalten sein sollen
    const jobs = await db.all(`
      SELECT j.*
      FROM jobs j
      LEFT JOIN rss_outgoing_feed_jobs f ON j.id = f.job_id
      WHERE j.status = 'active' OR (j.status = 'inactive' AND ? = 1)
      AND (f.job_id IS NULL OR f.include_in_feed = 1)
      ORDER BY j.created_at DESC
      LIMIT ?
    `, [config.include_inactive_jobs ? 1 : 0, config.max_items]);
    
    // Erstelle den RSS-Feed
    const feedItems = jobs.map((job: any) => {
      // Hole benutzerdefinierte Beschreibung, falls vorhanden
      const customDescription = db.get(`
        SELECT custom_description
        FROM rss_outgoing_feed_jobs
        WHERE job_id = ?
      `, [job.id]);
      
      const description = customDescription?.custom_description || job.rich_description || job.description;
      
      return `
        <item>
          <title><![CDATA[${job.title}]]></title>
          <description><![CDATA[${description}]]></description>
          <link>https://example.com/jobs/${job.id}</link>
          <guid isPermaLink="false">${job.id}</guid>
          <pubDate>${new Date(job.created_at).toUTCString()}</pubDate>
          <company><![CDATA[${job.company}]]></company>
          <location><![CDATA[${job.location}]]></location>
          ${job.salary_range ? `<salary><![CDATA[${job.salary_range}]]></salary>` : ''}
          <jobType><![CDATA[${job.job_type}]]></jobType>
          ${job.requirements ? `<requirements><![CDATA[${job.requirements}]]></requirements>` : ''}
        </item>
      `;
    }).join('\n');
    
    // Erstelle den kompletten Feed
    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${config.feed_title}</title>
    <link>${config.website_url || 'https://example.com'}</link>
    <description>${config.feed_description || 'Job-Angebote'}</description>
    <language>de-de</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${config.feed_url || 'https://example.com/jobs.rss'}" rel="self" type="application/rss+xml" />
    ${feedItems}
  </channel>
</rss>`;
    
    return feed;
  }
}
