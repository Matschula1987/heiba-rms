/**
 * Service für die Verwaltung von Bewerbungen (Applications)
 */

import { getDb } from './db';
import { 
  ApplicationExtended, 
  ApplicationFilter, 
  ApplicationListResponse,
  ApplicationResponse,
  CreateApplicationParams,
  UpdateApplicationParams,
  ChangeApplicationStatusParams,
  ExtendedApplicationStatus, 
  ApplicationNote,
  ApplicationTag,
  ApplicationAttachment,
  ApplicationMatchData
} from '@/types/applications';

import { v4 as uuidv4 } from 'uuid';
import matchingService from './matchingService';

/**
 * Bewerbungen mit Filteroptionen abrufen
 */
export async function getApplications(
  filter: ApplicationFilter
): Promise<ApplicationListResponse> {
  const db = await getDb();
  
  // Basisdaten der Bewerbungen laden
  let query = `
    SELECT a.* 
    FROM applications_extended a
    WHERE 1=1
  `;
  
  const queryParams: any[] = [];
  
  // Filter hinzufügen
  if (filter.searchText) {
    query += `
      AND (
        a.applicant_name LIKE ? OR
        a.applicant_email LIKE ? OR
        a.cover_letter LIKE ?
      )
    `;
    const searchTerm = `%${filter.searchText}%`;
    queryParams.push(searchTerm, searchTerm, searchTerm);
  }
  
  if (filter.statuses && filter.statuses.length > 0) {
    query += ` AND a.status IN (${filter.statuses.map(() => '?').join(',')})`;
    queryParams.push(...filter.statuses);
  }
  
  if (filter.sources && filter.sources.length > 0) {
    query += ` AND a.source IN (${filter.sources.map(() => '?').join(',')})`;
    queryParams.push(...filter.sources);
  }
  
  if (filter.jobIds && filter.jobIds.length > 0) {
    query += ` AND a.job_id IN (${filter.jobIds.map(() => '?').join(',')})`;
    queryParams.push(...filter.jobIds);
  }
  
  if (filter.assignedTo && filter.assignedTo.length > 0) {
    query += ` AND a.assigned_to IN (${filter.assignedTo.map(() => '?').join(',')})`;
    queryParams.push(...filter.assignedTo);
  }
  
  if (filter.matchScoreMin !== undefined) {
    query += ` AND a.match_score >= ?`;
    queryParams.push(filter.matchScoreMin);
  }
  
  if (filter.matchScoreMax !== undefined) {
    query += ` AND a.match_score <= ?`;
    queryParams.push(filter.matchScoreMax);
  }
  
  if (filter.dateFrom) {
    query += ` AND a.created_at >= ?`;
    queryParams.push(filter.dateFrom);
  }
  
  if (filter.dateTo) {
    query += ` AND a.created_at <= ?`;
    queryParams.push(filter.dateTo);
  }
  
  if (filter.hasCV !== undefined) {
    query += ` AND a.has_cv = ?`;
    queryParams.push(filter.hasCV ? 1 : 0);
  }
  
  // Tags filtern (komplexerer Fall, der einen Subquery erfordert)
  if (filter.tags && filter.tags.length > 0) {
    query += `
      AND a.id IN (
        SELECT application_id FROM application_tags 
        WHERE tag IN (${filter.tags.map(() => '?').join(',')})
        GROUP BY application_id
        HAVING COUNT(DISTINCT tag) = ?
      )
    `;
    queryParams.push(...filter.tags, filter.tags.length);
  }
  
  // Gesamtanzahl der gefilterten Einträge zählen
  const countQuery = `SELECT COUNT(*) as total FROM (${query}) as filteredApps`;
  const countResult = await db.get(countQuery, queryParams);
  const total = countResult?.total || 0;
  
  // Sortierung hinzufügen
  if (filter.sortBy) {
    const direction = filter.sortDirection === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY a.${filter.sortBy} ${direction}`;
  } else {
    query += ` ORDER BY a.created_at DESC`;
  }
  
  // Paginierung hinzufügen
  const page = filter.page ?? 0;
  const pageSize = filter.pageSize ?? 20;
  
  query += ` LIMIT ? OFFSET ?`;
  queryParams.push(pageSize, page * pageSize);
  
  // Bewerbungen abrufen
  const applications = await db.all(query, queryParams);
  
  // Umwandlung der Datenbankresultate in unser Interface-Format
  const formattedApplications: ApplicationExtended[] = await Promise.all(
    applications.map(async (app: any) => {
      const application: ApplicationExtended = {
        id: app.id,
        job_id: app.job_id,
        candidate_id: app.candidate_id,
        applicant_name: app.applicant_name,
        applicant_email: app.applicant_email,
        applicant_phone: app.applicant_phone,
        applicant_location: app.applicant_location,
        status: app.status as ExtendedApplicationStatus,
        status_reason: app.status_reason,
        status_changed_at: app.status_changed_at,
        status_changed_by: app.status_changed_by,
        source: app.source,
        source_detail: app.source_detail,
        cover_letter: app.cover_letter,
        has_cv: !!app.has_cv,
        cv_file_path: app.cv_file_path,
        has_documents: !!app.has_documents,
        documents_paths: app.documents_paths,
        match_score: app.match_score,
        match_data: app.match_data ? JSON.parse(app.match_data) : undefined,
        communication_history: app.communication_history ? JSON.parse(app.communication_history) : undefined,
        last_contact_at: app.last_contact_at,
        next_step: app.next_step,
        next_step_due_date: app.next_step_due_date,
        assigned_to: app.assigned_to,
        created_at: app.created_at,
        updated_at: app.updated_at
      };
      
      // Tags laden
      application.tags = await db.all(
        'SELECT * FROM application_tags WHERE application_id = ?',
        [app.id]
      );
      
      // Notizen laden
      application.notes = await db.all(
        'SELECT * FROM application_notes WHERE application_id = ?',
        [app.id]
      );
      
      // Anhänge laden
      application.attachments = await db.all(
        'SELECT * FROM application_attachments WHERE application_id = ?',
        [app.id]
      );
      
      return application;
    })
  );
  
  // Ergebnis zusammenstellen
  return {
    applications: formattedApplications,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}

/**
 * Bewerbung anhand der ID abrufen
 */
export async function getApplicationById(id: string): Promise<ApplicationResponse | null> {
  const db = await getDb();
  
  const application = await db.get(
    'SELECT * FROM applications_extended WHERE id = ?',
    [id]
  );
  
  if (!application) {
    return null;
  }
  
  // In unser Interface-Format umwandeln
  const formattedApplication: ApplicationExtended = {
    id: application.id,
    job_id: application.job_id,
    candidate_id: application.candidate_id,
    applicant_name: application.applicant_name,
    applicant_email: application.applicant_email,
    applicant_phone: application.applicant_phone,
    applicant_location: application.applicant_location,
    status: application.status as ExtendedApplicationStatus,
    status_reason: application.status_reason,
    status_changed_at: application.status_changed_at,
    status_changed_by: application.status_changed_by,
    source: application.source,
    source_detail: application.source_detail,
    cover_letter: application.cover_letter,
    has_cv: !!application.has_cv,
    cv_file_path: application.cv_file_path,
    has_documents: !!application.has_documents,
    documents_paths: application.documents_paths,
    match_score: application.match_score,
    match_data: application.match_data ? JSON.parse(application.match_data) : undefined,
    communication_history: application.communication_history ? JSON.parse(application.communication_history) : undefined,
    last_contact_at: application.last_contact_at,
    next_step: application.next_step,
    next_step_due_date: application.next_step_due_date,
    assigned_to: application.assigned_to,
    created_at: application.created_at,
    updated_at: application.updated_at
  };
  
  // Tags laden
  formattedApplication.tags = await db.all(
    'SELECT * FROM application_tags WHERE application_id = ?',
    [application.id]
  );
  
  // Notizen laden
  formattedApplication.notes = await db.all(
    'SELECT * FROM application_notes WHERE application_id = ?',
    [application.id]
  );
  
  // Anhänge laden
  formattedApplication.attachments = await db.all(
    'SELECT * FROM application_attachments WHERE application_id = ?',
    [application.id]
  );
  
  // Stellendaten laden (für bessere Darstellung)
  formattedApplication.job = await db.get(
    'SELECT id, title, company, location FROM jobs WHERE id = ?',
    [application.job_id]
  );
  
  // Kandidatendaten laden (falls verknüpft)
  if (application.candidate_id) {
    formattedApplication.candidate = await db.get(
      'SELECT id, name, email, phone, location FROM candidates WHERE id = ?',
      [application.candidate_id]
    );
  }
  
  return { application: formattedApplication };
}

/**
 * Neue Bewerbung erstellen
 */
export async function createApplication(
  params: CreateApplicationParams
): Promise<ApplicationResponse> {
  const db = await getDb();
  
  // ID generieren
  const id = uuidv4();
  
  // Matching-Score berechnen (falls möglich)
  let matchScore = null;
  let matchData = null;
  
  try {
    // Job-Daten für das Matching abrufen
    const job = await db.get('SELECT * FROM jobs WHERE id = ?', [params.job_id]);
    
    if (job) {
      // Temporäres Kandidaten-Objekt erstellen (für das Matching)
      const tempCandidate = {
        id: '',
        name: params.applicant_name,
        firstName: '',
        lastName: '',
        email: params.applicant_email,
        phone: params.applicant_phone,
        location: params.applicant_location,
        position: '',
        status: 'new',
        // Weitere Felder könnten aus dem Lebenslauf extrahiert werden
      } as any;
      
      // Matching durchführen
      const matchResult = await matchingService.calculateMatch(job, tempCandidate);
      matchScore = matchResult.score;
      matchData = JSON.stringify(matchResult.details);
    }
  } catch (error) {
    console.error('Fehler beim Matching der Bewerbung:', error);
    // Wir setzen den Prozess fort, auch wenn das Matching fehlschlägt
  }
  
  // Bewerbung in die Datenbank einfügen
  await db.run(`
    INSERT INTO applications_extended (
      id, job_id, candidate_id, 
      applicant_name, applicant_email, applicant_phone, applicant_location,
      status, source, source_detail, cover_letter,
      has_cv, match_score, match_data, assigned_to
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id, 
    params.job_id, 
    params.candidate_id || null,
    params.applicant_name,
    params.applicant_email,
    params.applicant_phone || null,
    params.applicant_location || null,
    params.status || 'new',
    params.source,
    params.source_detail || null,
    params.cover_letter || null,
    params.cover_letter ? 1 : 0, // has_cv (vereinfacht)
    matchScore,
    matchData,
    params.assigned_to || null
  ]);
  
  // Die erstellte Bewerbung zurückgeben
  return getApplicationById(id) as Promise<ApplicationResponse>;
}

/**
 * Bestehende Bewerbung aktualisieren
 */
export async function updateApplication(
  id: string,
  params: UpdateApplicationParams
): Promise<ApplicationResponse | null> {
  const db = await getDb();
  
  // Prüfen, ob die Bewerbung existiert
  const existingApplication = await db.get(
    'SELECT id FROM applications_extended WHERE id = ?',
    [id]
  );
  
  if (!existingApplication) {
    return null;
  }
  
  // Update-Felder und Parameter sammeln
  const updateFields: string[] = [];
  const updateParams: any[] = [];
  
  // Alle übergebenen Parameter durchgehen und in das Update aufnehmen
  if (params.job_id !== undefined) {
    updateFields.push('job_id = ?');
    updateParams.push(params.job_id);
  }
  
  if (params.candidate_id !== undefined) {
    updateFields.push('candidate_id = ?');
    updateParams.push(params.candidate_id);
  }
  
  if (params.applicant_name !== undefined) {
    updateFields.push('applicant_name = ?');
    updateParams.push(params.applicant_name);
  }
  
  if (params.applicant_email !== undefined) {
    updateFields.push('applicant_email = ?');
    updateParams.push(params.applicant_email);
  }
  
  if (params.applicant_phone !== undefined) {
    updateFields.push('applicant_phone = ?');
    updateParams.push(params.applicant_phone);
  }
  
  if (params.applicant_location !== undefined) {
    updateFields.push('applicant_location = ?');
    updateParams.push(params.applicant_location);
  }
  
  if (params.status !== undefined) {
    updateFields.push('status = ?');
    updateParams.push(params.status);
    updateFields.push('status_changed_at = CURRENT_TIMESTAMP');
  }
  
  if (params.status_reason !== undefined) {
    updateFields.push('status_reason = ?');
    updateParams.push(params.status_reason);
  }
  
  if (params.status_changed_by !== undefined) {
    updateFields.push('status_changed_by = ?');
    updateParams.push(params.status_changed_by);
  }
  
  if (params.source !== undefined) {
    updateFields.push('source = ?');
    updateParams.push(params.source);
  }
  
  if (params.source_detail !== undefined) {
    updateFields.push('source_detail = ?');
    updateParams.push(params.source_detail);
  }
  
  if (params.cover_letter !== undefined) {
    updateFields.push('cover_letter = ?');
    updateParams.push(params.cover_letter);
  }
  
  if (params.has_cv !== undefined) {
    updateFields.push('has_cv = ?');
    updateParams.push(params.has_cv ? 1 : 0);
  }
  
  if (params.cv_file_path !== undefined) {
    updateFields.push('cv_file_path = ?');
    updateParams.push(params.cv_file_path);
  }
  
  if (params.has_documents !== undefined) {
    updateFields.push('has_documents = ?');
    updateParams.push(params.has_documents ? 1 : 0);
  }
  
  if (params.documents_paths !== undefined) {
    updateFields.push('documents_paths = ?');
    updateParams.push(params.documents_paths);
  }
  
  if (params.match_score !== undefined) {
    updateFields.push('match_score = ?');
    updateParams.push(params.match_score);
  }
  
  if (params.match_data !== undefined) {
    updateFields.push('match_data = ?');
    updateParams.push(typeof params.match_data === 'string' 
      ? params.match_data 
      : JSON.stringify(params.match_data));
  }
  
  if (params.communication_history !== undefined) {
    updateFields.push('communication_history = ?');
    updateParams.push(typeof params.communication_history === 'string' 
      ? params.communication_history 
      : JSON.stringify(params.communication_history));
  }
  
  if (params.last_contact_at !== undefined) {
    updateFields.push('last_contact_at = ?');
    updateParams.push(params.last_contact_at);
  }
  
  if (params.next_step !== undefined) {
    updateFields.push('next_step = ?');
    updateParams.push(params.next_step);
  }
  
  if (params.next_step_due_date !== undefined) {
    updateFields.push('next_step_due_date = ?');
    updateParams.push(params.next_step_due_date);
  }
  
  if (params.assigned_to !== undefined) {
    updateFields.push('assigned_to = ?');
    updateParams.push(params.assigned_to);
  }
  
  // Aktualisierungszeitpunkt setzen
  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  
  // Nur aktualisieren, wenn es tatsächlich Änderungen gibt
  if (updateFields.length > 0) {
    const updateQuery = `
      UPDATE applications_extended 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;
    
    // ID als letzten Parameter hinzufügen
    updateParams.push(id);
    
    // Update ausführen
    await db.run(updateQuery, updateParams);
  }
  
  // Wenn Notizen hinzugefügt werden sollen
  if (params.notes && Array.isArray(params.notes)) {
    for (const note of params.notes) {
      if (!note.id) {
        // Neue Notiz einfügen
        await db.run(`
          INSERT INTO application_notes (
            id, application_id, user_id, content
          ) VALUES (?, ?, ?, ?)
        `, [uuidv4(), id, note.user_id, note.content]);
      }
    }
  }
  
  // Wenn Tags hinzugefügt werden sollen
  if (params.tags && Array.isArray(params.tags)) {
    // Zunächst alle bestehenden Tags löschen
    await db.run('DELETE FROM application_tags WHERE application_id = ?', [id]);
    
    // Dann neue Tags einfügen
    for (const tag of params.tags) {
      await db.run(`
        INSERT INTO application_tags (
          id, application_id, tag, created_by
        ) VALUES (?, ?, ?, ?)
      `, [uuidv4(), id, tag.tag, tag.created_by || null]);
    }
  }
  
  // Die aktualisierte Bewerbung zurückgeben
  return getApplicationById(id);
}

/**
 * Bewerbung löschen
 */
export async function deleteApplication(id: string): Promise<boolean> {
  const db = await getDb();
  
  try {
    // Zugehörige Datensätze löschen
    await db.run('DELETE FROM application_notes WHERE application_id = ?', [id]);
    await db.run('DELETE FROM application_tags WHERE application_id = ?', [id]);
    await db.run('DELETE FROM application_attachments WHERE application_id = ?', [id]);
    
    // Bewerbung löschen
    const result = await db.run('DELETE FROM applications_extended WHERE id = ?', [id]);
    
    return result.changes > 0;
  } catch (error) {
    console.error('Fehler beim Löschen der Bewerbung:', error);
    return false;
  }
}

/**
 * Status einer Bewerbung ändern
 */
export async function changeApplicationStatus(
  params: ChangeApplicationStatusParams
): Promise<ApplicationResponse | null> {
  const db = await getDb();
  
  try {
    await db.run(`
      UPDATE applications_extended
      SET status = ?, 
          status_reason = ?,
          status_changed_by = ?,
          status_changed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      params.status,
      params.reason || null,
      params.changed_by,
      params.application_id
    ]);
    
    return getApplicationById(params.application_id);
  } catch (error) {
    console.error('Fehler beim Ändern des Bewerbungsstatus:', error);
    return null;
  }
}

/**
 * Bewerber in einen Kandidaten konvertieren
 */
export async function convertToCandidate(
  applicationId: string,
  userId: string
): Promise<{ candidateId: string; application: ApplicationExtended } | null> {
  const db = await getDb();
  
  try {
    // Transaktion beginnen
    await db.run('BEGIN TRANSACTION');
    
    // Bewerbungsdaten abrufen
    const application = await db.get(
      'SELECT * FROM applications_extended WHERE id = ?',
      [applicationId]
    );
    
    if (!application) {
      await db.run('ROLLBACK');
      return null;
    }
    
    // Prüfen, ob Bewerbung bereits einem Kandidaten zugeordnet ist
    if (application.candidate_id) {
      // Bewerbung ist bereits einem Kandidaten zugeordnet
      const existingCandidate = await db.get(
        'SELECT * FROM candidates WHERE id = ?',
        [application.candidate_id]
      );
      
      if (existingCandidate) {
        // Bewerbung aktualisieren
        await db.run(`
          UPDATE applications_extended
          SET status = 'accepted',
              status_changed_by = ?,
              status_changed_at = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [userId, applicationId]);
        
        await db.run('COMMIT');
        
        // Aktualisierten Datensatz zurückgeben
        const updatedApplication = await getApplicationById(applicationId);
        
        return {
          candidateId: application.candidate_id,
          application: updatedApplication!.application
        };
      }
    }
    
    // Neuen Kandidaten anlegen
    const candidateId = uuidv4();
    
    await db.run(`
      INSERT INTO candidates (
        id, name, email, phone, location, status, 
        source, source_detail, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      candidateId,
      application.applicant_name,
      application.applicant_email,
      application.applicant_phone || null,
      application.applicant_location || null,
      'new', // Standardstatus für neue Kandidaten
      application.source,
      application.source_detail || null,
      userId
    ]);
    
    // Bewerbung mit dem neuen Kandidaten verknüpfen
    await db.run(`
      UPDATE applications_extended
      SET candidate_id = ?,
          status = 'accepted',
          status_changed_by = ?,
          status_changed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [candidateId, userId, applicationId]);
    
    // Notiz zur Konvertierung hinzufügen
    await db.run(`
      INSERT INTO application_notes (
        id, application_id, user_id, content
      ) VALUES (?, ?, ?, ?)
    `, [
      uuidv4(),
      applicationId,
      userId,
      `Bewerber wurde in einen Kandidaten konvertiert (ID: ${candidateId})`
    ]);
    
    // Transaktion abschließen
    await db.run('COMMIT');
    
    // Aktualisierten Datensatz zurückgeben
    const updatedApplication = await getApplicationById(applicationId);
    
    return {
      candidateId,
      application: updatedApplication!.application
    };
  } catch (error) {
    // Bei Fehler Transaktion zurückrollen
    await db.run('ROLLBACK');
    console.error('Fehler bei der Konvertierung zum Kandidaten:', error);
    return null;
  }
}

/**
 * Notiz zu einer Bewerbung hinzufügen
 */
export async function addApplicationNote(
  applicationId: string,
  userId: string,
  content: string
): Promise<ApplicationNote | null> {
  const db = await getDb();
  
  try {
    const noteId = uuidv4();
    
    await db.run(`
      INSERT INTO application_notes (
        id, application_id, user_id, content
      ) VALUES (?, ?, ?, ?)
    `, [noteId, applicationId, userId, content]);
    
    // Letzte Kontaktaufnahme aktualisieren
    await db.run(`
      UPDATE applications_extended
      SET last_contact_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [applicationId]);
    
    // Neue Notiz zurückgeben
    const note = await db.get(
      'SELECT * FROM application_notes WHERE id = ?',
      [noteId]
    );
    
    return note as ApplicationNote;
  } catch (error) {
    console.error('Fehler beim Hinzufügen der Notiz:', error);
    return null;
  }
}

/**
 * Tag zu einer Bewerbung hinzufügen
 */
export async function addApplicationTag(
  applicationId: string,
  tag: string,
  createdBy?: string
): Promise<ApplicationTag | null> {
  const db = await getDb();
  
  try {
    // Prüfen, ob das Tag bereits existiert
    const existingTag = await db.get(
      'SELECT * FROM application_tags WHERE application_id = ? AND tag = ?',
      [applicationId, tag]
    );
    
    if (existingTag) {
      return existingTag as ApplicationTag;
    }
    
    const tagId = uuidv4();
    
    await db.run(`
      INSERT INTO application_tags (
        id, application_id, tag, created_by
      ) VALUES (?, ?, ?, ?)
    `, [tagId, applicationId, tag, createdBy || null]);
    
    // Neues Tag zurückgeben
    const newTag = await db.get(
      'SELECT * FROM application_tags WHERE id = ?',
      [tagId]
    );
    
    return newTag as ApplicationTag;
  } catch (error) {
    console.error('Fehler beim Hinzufügen des Tags:', error);
    return null;
  }
}

/**
 * Document-Attachment zu einer Bewerbung hinzufügen
 */
export async function addApplicationAttachment(
  applicationId: string,
  fileName: string,
  filePath: string,
  fileType: string,
  fileSize?: number
): Promise<ApplicationAttachment | null> {
  const db = await getDb();
  
  try {
    const attachmentId = uuidv4();
    
    await db.run(`
      INSERT INTO application_attachments (
        id, application_id, file_name, file_path, file_type, file_size
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [attachmentId, applicationId, fileName, filePath, fileType, fileSize || null]);
    
    // Bestimmte Dokument-Typen besonders behandeln
    if (fileType === 'resume') {
      // CV-Flag setzen
      await db.run(`
        UPDATE applications_extended
        SET has_cv = 1,
            cv_file_path = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [filePath, applicationId]);
    } else if (fileType === 'certificate' || fileType === 'reference') {
      // documents-Flag setzen
      await db.run(`
        UPDATE applications_extended
        SET has_documents = 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [applicationId]);
      
      // Pfade aktualisieren
      const app = await db.get(
        'SELECT documents_paths FROM applications_extended WHERE id = ?',
        [applicationId]
      );
      
      let paths: string[] = [];
      
      if (app && app.documents_paths) {
        try {
          paths = JSON.parse(app.documents_paths);
        } catch (e) {
          paths = [];
        }
      }
      
      paths.push(filePath);
      
      await db.run(`
        UPDATE applications_extended
        SET documents_paths = ?
        WHERE id = ?
      `, [JSON.stringify(paths), applicationId]);
    }
    
    // Neuen Anhang zurückgeben
    const attachment = await db.get(
      'SELECT * FROM application_attachments WHERE id = ?',
      [attachmentId]
    );
    
    return attachment as ApplicationAttachment;
  } catch (error) {
    console.error('Fehler beim Hinzufügen des Anhangs:', error);
    return null;
  }
}

/**
 * Berechne den Match-Score zwischen einer Bewerbung und dem zugehörigen Job
 */
export async function calculateApplicationMatch(
  applicationId: string
): Promise<{ score: number; details: any }> {
  const db = await getDb();
  
  try {
    // Bewerbungsdaten abrufen
    const application = await db.get(
      'SELECT * FROM applications_extended WHERE id = ?',
      [applicationId]
    );
    
    if (!application) {
      throw new Error(`Bewerbung mit ID ${applicationId} wurde nicht gefunden`);
    }
    
    // Job-Daten abrufen
    const job = await db.get('SELECT * FROM jobs WHERE id = ?', [application.job_id]);
    
    if (!job) {
      throw new Error(`Job mit ID ${application.job_id} wurde nicht gefunden`);
    }
    
    // Temporäres Kandidatenobjekt erstellen
    const candidateData = {
      id: application.candidate_id || '',
      name: application.applicant_name,
      firstName: application.applicant_name.split(' ')[0],
      lastName: application.applicant_name.split(' ').slice(1).join(' '),
      email: application.applicant_email,
      phone: application.applicant_phone,
      location: application.applicant_location,
      position: '',
      status: 'new'
    } as any;
    
    // Lebenslauf-Daten hinzufügen, falls vorhanden
    if (application.has_cv && application.cv_file_path) {
      // Hier könnte in einem realen System der Lebenslauf analysiert werden
      // Für dieses Beispiel nehmen wir nur an, dass ein Lebenslauf existiert
      candidateData.has_resume = true;
    }
    
    // Matching durchführen
    const matchResult = await matchingService.calculateMatch(job, candidateData);
    
    // Match-Daten in der Datenbank aktualisieren
    await db.run(`
      UPDATE applications_extended
      SET match_score = ?,
          match_data = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      matchResult.score,
      JSON.stringify(matchResult.details),
      applicationId
    ]);
    
    return {
      score: matchResult.score,
      details: matchResult.details
    };
  } catch (error) {
    console.error('Fehler beim Berechnen des Match-Scores:', error);
    return {
      score: 0,
      details: { error: 'Fehler beim Matching-Prozess' }
    };
  }
}
