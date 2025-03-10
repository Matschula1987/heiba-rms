import { getDb } from './db';

/**
 * Prüft, ob die Bewerbungstabellen bereits existieren
 */
export async function checkApplicationsTablesExist(): Promise<boolean> {
  try {
    const db = await getDb();
    
    const tablesExist = await db.get(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='applications_extended'
    `);
    
    return !!tablesExist;
  } catch (error) {
    console.error('Error checking if applications tables exist:', error);
    throw error;
  }
}

/**
 * Erstellt die erweiterten Bewerbungstabellen in der Datenbank
 */
export async function migrateApplicationsSchema(): Promise<void> {
  try {
    const db = await getDb();
    
    // Prüfen, ob die Bewerbungstabellen bereits existieren
    const applicationsTablesExist = await checkApplicationsTablesExist();
    
    if (applicationsTablesExist) {
      console.log('Applications tables already exist, skipping migration.');
      return;
    }
    
    console.log('Creating applications_extended tables...');
    
    // Create applications_extended table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS applications_extended (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
        applicant_name TEXT NOT NULL,
        applicant_email TEXT NOT NULL,
        applicant_phone TEXT,
        applicant_location TEXT,
        source TEXT CHECK(source IN ('email', 'portal', 'website', 'direct', 'referral', 'agency', 'other')) DEFAULT 'email',
        source_detail TEXT,
        job_id TEXT,
        status TEXT CHECK(status IN ('new', 'in_review', 'interview', 'accepted', 'rejected', 'archived')) DEFAULT 'new',
        status_changed_at TIMESTAMP,
        has_cv BOOLEAN DEFAULT 0,
        cv_file_path TEXT,
        has_documents BOOLEAN DEFAULT 0,
        documents_paths TEXT,
        cover_letter TEXT,
        match_score REAL,
        match_data TEXT,
        communication_history TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
      )
    `);
    
    // Create applications_notes table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS application_notes (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
        application_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES applications_extended(id) ON DELETE CASCADE
      )
    `);
    
    // Create applications_tags table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS application_tags (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
        application_id TEXT NOT NULL,
        tag TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT,
        FOREIGN KEY (application_id) REFERENCES applications_extended(id) ON DELETE CASCADE
      )
    `);
    
    // Create applications_status_history table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS application_status_history (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)))),
        application_id TEXT NOT NULL,
        old_status TEXT,
        new_status TEXT NOT NULL,
        changed_by TEXT,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES applications_extended(id) ON DELETE CASCADE
      )
    `);
    
    // Indizes erstellen für optimierte Leistung
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_applications_extended_status ON applications_extended(status);
      CREATE INDEX IF NOT EXISTS idx_applications_extended_job_id ON applications_extended(job_id);
      CREATE INDEX IF NOT EXISTS idx_applications_extended_created_at ON applications_extended(created_at);
      CREATE INDEX IF NOT EXISTS idx_applications_extended_match_score ON applications_extended(match_score);
      CREATE INDEX IF NOT EXISTS idx_application_notes_application_id ON application_notes(application_id);
      CREATE INDEX IF NOT EXISTS idx_application_tags_application_id ON application_tags(application_id);
      CREATE INDEX IF NOT EXISTS idx_application_tags_tag ON application_tags(tag);
      CREATE INDEX IF NOT EXISTS idx_application_status_history_application_id ON application_status_history(application_id);
    `);
    
    // Trigger für das Aktualisieren von updated_at
    await db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_applications_extended_timestamp 
      AFTER UPDATE ON applications_extended
      BEGIN
        UPDATE applications_extended SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
    `);
    
    // Trigger für das Aktualisieren von status_changed_at bei Statusänderung
    await db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_applications_extended_status_changed_at
      AFTER UPDATE OF status ON applications_extended
      BEGIN
        UPDATE applications_extended SET status_changed_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND NEW.status != OLD.status;
        INSERT INTO application_status_history (application_id, old_status, new_status)
        VALUES (NEW.id, OLD.status, NEW.status);
      END;
    `);
    
    console.log('Applications tables created successfully');
  } catch (error) {
    console.error('Error migrating applications schema:', error);
    throw error;
  }
}

/**
 * Fügt Testdaten für Bewerbungen ein
 */
export async function insertApplicationTestData(): Promise<void> {
  try {
    const db = await getDb();
    
    console.log('Inserting test applications data...');
    
    // Aktive Jobs für die Bewerbungszuordnung abrufen
    const jobs = await db.all(`SELECT id, title, company FROM jobs LIMIT 5`);
    
    if (!jobs || jobs.length === 0) {
      console.log('No jobs found for application test data, creating some dummy jobs first');
      
      // Füge einige Dummy-Jobs ein, wenn keine vorhanden sind
      await db.run(`
        INSERT INTO jobs (title, company, description, location, status)
        VALUES 
          ('Frontend Developer', 'HeiBa Tech', 'Frontend Entwicklung mit React', 'Berlin', 'active'),
          ('Backend Developer', 'HeiBa Tech', 'Backend Entwicklung mit Node.js', 'München', 'active'),
          ('Full Stack Developer', 'HeiBa Solutions', 'Volle Stack-Entwicklung', 'Hamburg', 'active')
      `);
      
      // Jobs erneut abrufen
      const newJobs = await db.all(`SELECT id, title, company FROM jobs LIMIT 5`);
      console.log('Created dummy jobs:', newJobs);
    }
    
    // Testdaten für Bewerbungen
    const applications = [
      {
        applicant_name: 'Max Mustermann',
        applicant_email: 'max.mustermann@example.com',
        applicant_phone: '+49 123 4567890',
        applicant_location: 'Berlin',
        source: 'email',
        job_id: jobs[0]?.id || null,
        status: 'new',
        has_cv: true,
        cv_file_path: '/uploads/test/max_mustermann_cv.pdf',
        cover_letter: 'Sehr geehrte Damen und Herren,\n\nich bewerbe mich für die Stelle als Frontend Developer...',
        match_score: 85,
        match_data: JSON.stringify({
          categoryScores: {
            skills: 90,
            experience: 80,
            location: 100,
            education: 70
          },
          matchedSkills: [
            { skill: 'React', score: 95 },
            { skill: 'TypeScript', score: 90 },
            { skill: 'CSS', score: 85 }
          ],
          matchDetails: 'Starker Match aufgrund hervorragender Frontend-Kenntnisse und Berliner Standort.'
        })
      },
      {
        applicant_name: 'Anna Schmidt',
        applicant_email: 'anna.schmidt@example.com',
        applicant_phone: '+49 987 6543210',
        applicant_location: 'München',
        source: 'portal',
        source_detail: 'Indeed',
        job_id: jobs[1]?.id || null,
        status: 'in_review',
        has_cv: true,
        cv_file_path: '/uploads/test/anna_schmidt_cv.pdf',
        has_documents: true,
        documents_paths: JSON.stringify([
          '/uploads/test/anna_schmidt_certificate1.pdf',
          '/uploads/test/anna_schmidt_certificate2.pdf'
        ]),
        cover_letter: 'Sehr geehrte Damen und Herren,\n\nals erfahrene Backend-Entwicklerin bewerbe ich mich...',
        match_score: 70,
        match_data: JSON.stringify({
          categoryScores: {
            skills: 75,
            experience: 65,
            location: 60,
            education: 80
          },
          matchedSkills: [
            { skill: 'Node.js', score: 80 },
            { skill: 'Express', score: 75 },
            { skill: 'MongoDB', score: 70 }
          ],
          matchDetails: 'Guter Match mit Backend-Kenntnissen, aber anderer Standort als bevorzugt.'
        })
      },
      {
        applicant_name: 'Thomas Weber',
        applicant_email: 'thomas.weber@example.com',
        applicant_phone: '+49 555 1234567',
        applicant_location: 'Hamburg',
        source: 'referral',
        source_detail: 'Empfehlung von Mitarbeiter Hans Müller',
        job_id: jobs[2]?.id || null,
        status: 'interview',
        has_cv: true,
        cv_file_path: '/uploads/test/thomas_weber_cv.pdf',
        cover_letter: 'Sehr geehrtes HeiBa-Team,\n\nüber Herrn Hans Müller wurde ich auf Ihre Stelle aufmerksam...',
        match_score: 92,
        match_data: JSON.stringify({
          categoryScores: {
            skills: 95,
            experience: 90,
            location: 90,
            education: 85
          },
          matchedSkills: [
            { skill: 'React', score: 95 },
            { skill: 'Node.js', score: 90 },
            { skill: 'TypeScript', score: 95 },
            { skill: 'Express', score: 90 }
          ],
          matchDetails: 'Ausgezeichneter Match für die Full Stack Position mit allen erforderlichen Fähigkeiten und Erfahrungen.'
        }),
        communication_history: JSON.stringify([
          {
            type: 'email',
            date: '2025-02-15T10:30:00',
            sender: 'recruiting@heiba.com',
            content: 'Vielen Dank für Ihre Bewerbung. Wir möchten Sie gerne zu einem Vorstellungsgespräch einladen.'
          },
          {
            type: 'email',
            date: '2025-02-15T14:45:00',
            sender: 'thomas.weber@example.com',
            content: 'Vielen Dank für die Einladung. Ich würde mich sehr über ein Gespräch freuen.'
          },
          {
            type: 'note',
            date: '2025-02-16T09:15:00',
            user: 'Sarah (HR)',
            content: 'Telefonat mit Herrn Weber geführt. Termin für Interview vereinbart.'
          }
        ])
      },
      {
        applicant_name: 'Julia Becker',
        applicant_email: 'julia.becker@example.com',
        applicant_phone: '+49 333 7777888',
        applicant_location: 'Frankfurt',
        source: 'website',
        job_id: jobs[0]?.id || null,
        status: 'new',
        has_cv: false,
        cover_letter: 'Hallo HeiBa-Team,\n\nich habe Ihre Stellenanzeige auf Ihrer Website gesehen und bin sehr interessiert...',
        match_score: 65
      },
      {
        applicant_name: 'Michael Hoffmann',
        applicant_email: 'michael.hoffmann@example.com',
        applicant_phone: '+49 444 5556666',
        applicant_location: 'Köln',
        source: 'agency',
        source_detail: 'TalentHunters GmbH',
        job_id: jobs[1]?.id || null,
        status: 'rejected',
        has_cv: true,
        cv_file_path: '/uploads/test/michael_hoffmann_cv.pdf',
        cover_letter: 'Sehr geehrte Damen und Herren,\n\ndie TalentHunters GmbH empfiehlt mich für die ausgeschriebene Position...',
        match_score: 45,
        communication_history: JSON.stringify([
          {
            type: 'email',
            date: '2025-02-10T11:30:00',
            sender: 'recruiting@heiba.com',
            content: 'Vielen Dank für Ihre Bewerbung. Leider müssen wir Ihnen mitteilen, dass wir uns für einen anderen Kandidaten entschieden haben.'
          }
        ])
      }
    ];
    
    // Bewerbungen einfügen
    for (const application of applications) {
      const columns = Object.keys(application).join(', ');
      const placeholders = Object.keys(application).map(() => '?').join(', ');
      const values = Object.values(application);
      
      await db.run(
        `INSERT INTO applications_extended (${columns}) VALUES (${placeholders})`,
        values
      );
    }
    
    // IDs der eingefügten Bewerbungen abrufen
    const appIds = await db.all(`SELECT id FROM applications_extended`);
    
    // Einige Notizen hinzufügen
    const notes = [
      {
        application_id: appIds[0].id,
        user_id: 'admin',
        content: 'Kandidat hat sehr gutes Portfolio auf GitHub.'
      },
      {
        application_id: appIds[1].id,
        user_id: 'admin',
        content: 'Frühere Erfahrung mit ähnlichen Projekten. Sollten bald ein Interview ansetzen.'
      },
      {
        application_id: appIds[2].id,
        user_id: 'admin',
        content: 'Gespräch sehr positiv verlaufen, technisches Know-how überdurchschnittlich.'
      },
      {
        application_id: appIds[2].id,
        user_id: 'recruiter1',
        content: 'Zweites Gespräch mit Team-Lead vereinbart für nächste Woche.'
      }
    ];
    
    // Notizen einfügen
    for (const note of notes) {
      await db.run(
        `INSERT INTO application_notes (application_id, user_id, content) VALUES (?, ?, ?)`,
        [note.application_id, note.user_id, note.content]
      );
    }
    
    // Einige Tags hinzufügen
    const tags = [
      { application_id: appIds[0].id, tag: 'Frontend', created_by: 'admin' },
      { application_id: appIds[0].id, tag: 'React', created_by: 'admin' },
      { application_id: appIds[1].id, tag: 'Backend', created_by: 'admin' },
      { application_id: appIds[1].id, tag: 'Node.js', created_by: 'admin' },
      { application_id: appIds[2].id, tag: 'Full Stack', created_by: 'admin' },
      { application_id: appIds[2].id, tag: 'Empfehlung', created_by: 'admin' },
      { application_id: appIds[2].id, tag: 'Top Kandidat', created_by: 'recruiter1' }
    ];
    
    // Tags einfügen
    for (const tag of tags) {
      await db.run(
        `INSERT INTO application_tags (application_id, tag, created_by) VALUES (?, ?, ?)`,
        [tag.application_id, tag.tag, tag.created_by]
      );
    }
    
    // Einige Status-Änderungen in der Historie
    const statusChanges = [
      {
        application_id: appIds[1].id,
        old_status: 'new',
        new_status: 'in_review',
        changed_by: 'admin',
        reason: 'Bewerbung sieht vielversprechend aus, Review gestartet'
      },
      {
        application_id: appIds[2].id,
        old_status: 'new',
        new_status: 'in_review',
        changed_by: 'admin',
        reason: 'Review gestartet aufgrund der guten Empfehlung'
      },
      {
        application_id: appIds[2].id,
        old_status: 'in_review',
        new_status: 'interview',
        changed_by: 'admin',
        reason: 'Zum Interview eingeladen nach positivem Review'
      },
      {
        application_id: appIds[4].id,
        old_status: 'new',
        new_status: 'in_review',
        changed_by: 'admin',
        reason: 'Review gestartet'
      },
      {
        application_id: appIds[4].id,
        old_status: 'in_review',
        new_status: 'rejected',
        changed_by: 'admin',
        reason: 'Fehlende technische Erfahrung für die Position'
      }
    ];
    
    // Status-Änderungen einfügen
    for (const change of statusChanges) {
      await db.run(
        `INSERT INTO application_status_history (application_id, old_status, new_status, changed_by, reason) 
        VALUES (?, ?, ?, ?, ?)`,
        [change.application_id, change.old_status, change.new_status, change.changed_by, change.reason]
      );
    }
    
    console.log('Test applications data inserted successfully');
  } catch (error) {
    console.error('Error inserting application test data:', error);
    throw error;
  }
}
