/**
 * Service für die Verwaltung der gespeicherten Filter
 */

import { getDb } from './db';
import { 
  SavedFilter, 
  JobFilter, 
  CandidateFilter, 
  CustomerFilter 
} from '@/types/filters';

/**
 * Speichert einen Filter
 * @param filter Der zu speichernde Filter
 * @returns Die ID des gespeicherten Filters
 */
export async function saveFilter(filter: Omit<SavedFilter, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = await getDb();
  
  // Prüfen, ob es sich um einen Standardfilter handelt
  if (filter.isDefault) {
    // Bestehenden Standardfilter für diesen Entitätstyp deaktivieren
    await db.run(`
      UPDATE saved_filters
      SET is_default = 0
      WHERE entity_type = ? AND created_by = ? AND is_default = 1
    `, [filter.entityType, filter.createdBy]);
  }
  
  // Filter speichern
  const result = await db.run(`
    INSERT INTO saved_filters (
      name, entity_type, filter_json, is_default, created_by
    ) VALUES (?, ?, ?, ?, ?)
  `, [
    filter.name,
    filter.entityType,
    JSON.stringify(filter.filter),
    filter.isDefault ? 1 : 0,
    filter.createdBy
  ]);
  
  const id = result.lastID.toString();
  
  return id;
}

/**
 * Aktualisiert einen bestehenden Filter
 * @param id Die ID des Filters
 * @param filter Die zu aktualisierenden Daten
 * @returns true, wenn erfolgreich
 */
export async function updateFilter(
  id: string, 
  filter: Partial<Omit<SavedFilter, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<boolean> {
  const db = await getDb();
  
  // Bestehenden Filter abrufen
  const existingFilter = await db.get(`
    SELECT * FROM saved_filters WHERE id = ?
  `, [id]);
  
  if (!existingFilter) {
    return false;
  }
  
  // Prüfen, ob es sich um einen Standardfilter handelt
  if (filter.isDefault) {
    // Bestehenden Standardfilter für diesen Entitätstyp deaktivieren
    await db.run(`
      UPDATE saved_filters
      SET is_default = 0
      WHERE entity_type = ? AND created_by = ? AND is_default = 1 AND id != ?
    `, [
      filter.entityType || existingFilter.entity_type,
      filter.createdBy || existingFilter.created_by,
      id
    ]);
  }
  
  // Filter-Werte vorbereiten
  const updateValues: any = {};
  const params: any[] = [];
  const updateFields: string[] = [];
  
  if (filter.name !== undefined) {
    updateFields.push('name = ?');
    params.push(filter.name);
  }
  
  if (filter.entityType !== undefined) {
    updateFields.push('entity_type = ?');
    params.push(filter.entityType);
  }
  
  if (filter.filter !== undefined) {
    updateFields.push('filter_json = ?');
    params.push(JSON.stringify(filter.filter));
  }
  
  if (filter.isDefault !== undefined) {
    updateFields.push('is_default = ?');
    params.push(filter.isDefault ? 1 : 0);
  }
  
  if (filter.createdBy !== undefined) {
    updateFields.push('created_by = ?');
    params.push(filter.createdBy);
  }
  
  // Updated_at-Zeitstempel aktualisieren
  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  
  // Prüfen, ob es etwas zu aktualisieren gibt
  if (updateFields.length === 0) {
    return true; // Nichts zu tun
  }
  
  // SQL-Abfrage erstellen
  const sql = `
    UPDATE saved_filters
    SET ${updateFields.join(', ')}
    WHERE id = ?
  `;
  
  // ID als letzten Parameter hinzufügen
  params.push(id);
  
  // Aktualisierung durchführen
  const result = await db.run(sql, params);
  
  return result.changes > 0;
}

/**
 * Löscht einen Filter
 * @param id Die ID des zu löschenden Filters
 * @returns true, wenn erfolgreich
 */
export async function deleteFilter(id: string): Promise<boolean> {
  const db = await getDb();
  
  const result = await db.run(`
    DELETE FROM saved_filters
    WHERE id = ?
  `, [id]);
  
  return result.changes > 0;
}

/**
 * Ruft einen einzelnen Filter ab
 * @param id Die ID des Filters
 * @returns Der Filter oder null, wenn nicht gefunden
 */
export async function getFilter(id: string): Promise<SavedFilter | null> {
  const db = await getDb();
  
  const result = await db.get(`
    SELECT * FROM saved_filters
    WHERE id = ?
  `, [id]);
  
  if (!result) {
    return null;
  }
  
  return {
    id: result.id,
    name: result.name,
    entityType: result.entity_type,
    filter: JSON.parse(result.filter_json),
    isDefault: result.is_default === 1,
    createdBy: result.created_by,
    createdAt: result.created_at,
    updatedAt: result.updated_at
  };
}

/**
 * Ruft alle Filter für einen bestimmten Entitätstyp und Benutzer ab
 * @param entityType Der Entitätstyp (job, candidate, customer)
 * @param userId Die ID des Benutzers
 * @returns Eine Liste der Filter
 */
export async function getFilters(
  entityType: 'job' | 'candidate' | 'customer',
  userId: string
): Promise<SavedFilter[]> {
  const db = await getDb();
  
  const results = await db.all(`
    SELECT * FROM saved_filters
    WHERE entity_type = ? AND created_by = ?
    ORDER BY name ASC
  `, [entityType, userId]);
  
  return results.map((result: any) => ({
    id: result.id,
    name: result.name,
    entityType: result.entity_type,
    filter: JSON.parse(result.filter_json),
    isDefault: result.is_default === 1,
    createdBy: result.created_by,
    createdAt: result.created_at,
    updatedAt: result.updated_at
  }));
}

/**
 * Ruft den Standardfilter für einen bestimmten Entitätstyp und Benutzer ab
 * @param entityType Der Entitätstyp (job, candidate, customer)
 * @param userId Die ID des Benutzers
 * @returns Der Standardfilter oder null, wenn keiner existiert
 */
export async function getDefaultFilter(
  entityType: 'job' | 'candidate' | 'customer',
  userId: string
): Promise<SavedFilter | null> {
  const db = await getDb();
  
  const result = await db.get(`
    SELECT * FROM saved_filters
    WHERE entity_type = ? AND created_by = ? AND is_default = 1
    LIMIT 1
  `, [entityType, userId]);
  
  if (!result) {
    return null;
  }
  
  return {
    id: result.id,
    name: result.name,
    entityType: result.entity_type,
    filter: JSON.parse(result.filter_json),
    isDefault: result.is_default === 1,
    createdBy: result.created_by,
    createdAt: result.created_at,
    updatedAt: result.updated_at
  };
}

/**
 * Wendet einen Filter auf eine SQL-Abfrage an
 * @param baseQuery Die Basis-SQL-Abfrage
 * @param filter Der Filter
 * @param entityType Der Entitätstyp
 * @returns Ein Objekt mit der erweiterten SQL-Abfrage und den Parametern
 */
export function applyFilterToQuery(
  baseQuery: string,
  filter: JobFilter | CandidateFilter | CustomerFilter,
  entityType: 'job' | 'candidate' | 'customer'
): { query: string; params: any[] } {
  let query = baseQuery;
  const params: any[] = [];
  const conditions: string[] = [];
  
  // Gemeinsame Filter
  if (filter.searchText) {
    const searchConditions: string[] = [];
    
    if (entityType === 'job') {
      searchConditions.push('title LIKE ?');
      searchConditions.push('description LIKE ?');
      searchConditions.push('location LIKE ?');
      searchConditions.push('company LIKE ?');
      
      for (let i = 0; i < searchConditions.length; i++) {
        params.push(`%${filter.searchText}%`);
      }
    } else if (entityType === 'candidate') {
      searchConditions.push('name LIKE ?');
      searchConditions.push('email LIKE ?');
      searchConditions.push('position LIKE ?');
      searchConditions.push('location LIKE ?');
      
      for (let i = 0; i < searchConditions.length; i++) {
        params.push(`%${filter.searchText}%`);
      }
    } else if (entityType === 'customer') {
      searchConditions.push('name LIKE ?');
      searchConditions.push('industry LIKE ?');
      searchConditions.push('address LIKE ?');
      
      for (let i = 0; i < searchConditions.length; i++) {
        params.push(`%${filter.searchText}%`);
      }
    }
    
    if (searchConditions.length > 0) {
      conditions.push(`(${searchConditions.join(' OR ')})`);
    }
  }
  
  // Spezifische Filter basierend auf dem Entitätstyp
  if (entityType === 'job') {
    const jobFilter = filter as JobFilter;
    
    if (jobFilter.status && jobFilter.status.length > 0) {
      conditions.push(`status IN (${jobFilter.status.map(() => '?').join(', ')})`);
      params.push(...jobFilter.status);
    }
    
    if (jobFilter.locations && jobFilter.locations.length > 0) {
      const locationConditions = jobFilter.locations.map(() => 'location LIKE ?');
      conditions.push(`(${locationConditions.join(' OR ')})`);
      jobFilter.locations.forEach(location => params.push(`%${location}%`));
    }
    
    if (jobFilter.departments && jobFilter.departments.length > 0) {
      const deptConditions = jobFilter.departments.map(() => 'department LIKE ?');
      conditions.push(`(${deptConditions.join(' OR ')})`);
      jobFilter.departments.forEach(dept => params.push(`%${dept}%`));
    }
    
    if (jobFilter.jobTypes && jobFilter.jobTypes.length > 0) {
      conditions.push(`job_type IN (${jobFilter.jobTypes.map(() => '?').join(', ')})`);
      params.push(...jobFilter.jobTypes);
    }
    
    if (jobFilter.minSalary) {
      // Annahme: Gehalt ist in einem Feld salary_min oder wird aus einem Bereich extrahiert
      conditions.push('(salary_min >= ? OR salary_range LIKE ?)');
      params.push(jobFilter.minSalary, `%${jobFilter.minSalary}%`);
    }
    
    if (jobFilter.maxSalary) {
      // Annahme: Gehalt ist in einem Feld salary_max oder wird aus einem Bereich extrahiert
      conditions.push('(salary_max <= ? OR salary_range LIKE ?)');
      params.push(jobFilter.maxSalary, `%${jobFilter.maxSalary}%`);
    }
    
    if (jobFilter.createdAfter) {
      conditions.push('created_at >= ?');
      params.push(jobFilter.createdAfter);
    }
    
    if (jobFilter.createdBefore) {
      conditions.push('created_at <= ?');
      params.push(jobFilter.createdBefore);
    }
    
    // Für Skills müsste je nach Datenbankstruktur eine separate Abfrage oder Join erfolgen
    // Hier vereinfacht dargestellt
    if (jobFilter.skills && jobFilter.skills.length > 0) {
      const skillConditions = jobFilter.skills.map(() => 'requirements LIKE ?');
      conditions.push(`(${skillConditions.join(' OR ')})`);
      jobFilter.skills.forEach(skill => params.push(`%${skill}%`));
    }
  } else if (entityType === 'candidate') {
    const candidateFilter = filter as CandidateFilter;
    
    if (candidateFilter.status && candidateFilter.status.length > 0) {
      conditions.push(`status IN (${candidateFilter.status.map(() => '?').join(', ')})`);
      params.push(...candidateFilter.status);
    }
    
    if (candidateFilter.locations && candidateFilter.locations.length > 0) {
      const locationConditions = candidateFilter.locations.map(() => 'location LIKE ?');
      conditions.push(`(${locationConditions.join(' OR ')})`);
      candidateFilter.locations.forEach(location => params.push(`%${location}%`));
    }
    
    // Weitere spezifische Filter für Kandidaten
    // ...
  } else if (entityType === 'customer') {
    const customerFilter = filter as CustomerFilter;
    
    if (customerFilter.type && customerFilter.type.length > 0) {
      conditions.push(`type IN (${customerFilter.type.map(() => '?').join(', ')})`);
      params.push(...customerFilter.type);
    }
    
    if (customerFilter.status && customerFilter.status.length > 0) {
      conditions.push(`status IN (${customerFilter.status.map(() => '?').join(', ')})`);
      params.push(...customerFilter.status);
    }
    
    // Weitere spezifische Filter für Kunden
    // ...
  }
  
  // Bedingungen der Abfrage hinzufügen
  if (conditions.length > 0) {
    // Prüfen, ob die Abfrage bereits eine WHERE-Klausel hat
    if (query.toLowerCase().includes('where')) {
      query += ` AND ${conditions.join(' AND ')}`;
    } else {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
  }
  
  // Sortierung hinzufügen
  if (filter.sortBy) {
    query += ` ORDER BY ${filter.sortBy} ${filter.sortDirection === 'desc' ? 'DESC' : 'ASC'}`;
  }
  
  // Paginierung hinzufügen
  if (filter.page !== undefined && filter.pageSize !== undefined) {
    const offset = filter.page * filter.pageSize;
    query += ` LIMIT ? OFFSET ?`;
    params.push(filter.pageSize, offset);
  }
  
  return { query, params };
}
