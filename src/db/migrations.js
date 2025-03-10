const Database = require('better-sqlite3')
const { testCandidates } = require('../data/testCandidates')
const { testJobs } = require('../data/testJobs')

// Initialisiere die Datenbank
const db = new Database('heiba.db')

function migrate() {
  // Erstelle Tabellen
  db.exec(`
    CREATE TABLE IF NOT EXISTS candidates (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      mobile TEXT,
      date_of_birth TEXT,
      position TEXT NOT NULL,
      location TEXT NOT NULL,
      address TEXT NOT NULL,
      skills TEXT NOT NULL,
      experience INTEGER NOT NULL,
      education TEXT NOT NULL,
      salary_expectation INTEGER,
      status TEXT NOT NULL,
      source TEXT NOT NULL,
      application_date TEXT NOT NULL,
      documents TEXT,
      qualification_profile TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      department TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      required_skills TEXT NOT NULL,
      required_experience INTEGER NOT NULL,
      required_education TEXT NOT NULL,
      salary_range TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  // Prüfe ob bereits Daten vorhanden sind
  const candidateCount = db.prepare('SELECT COUNT(*) as count FROM candidates').get().count
  const jobCount = db.prepare('SELECT COUNT(*) as count FROM jobs').get().count
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count

  // Füge Testdaten ein
  if (candidateCount === 0) {
    const insertCandidate = db.prepare(`
      INSERT INTO candidates (
        id, first_name, last_name, email, phone, mobile, date_of_birth,
        position, location, address, skills, experience, education,
        salary_expectation, status, source, application_date, documents,
        qualification_profile, created_at, updated_at
      ) VALUES (
        @id, @firstName, @lastName, @email, @phone, @mobile, @dateOfBirth,
        @position, @location, @address, @skills, @experience, @education,
        @salaryExpectation, @status, @source, @applicationDate, @documents,
        @qualificationProfile, @createdAt, @updatedAt
      )
    `)

    for (const candidate of testCandidates) {
      insertCandidate.run({
        ...candidate,
        address: JSON.stringify(candidate.address),
        skills: JSON.stringify(candidate.skills),
        documents: JSON.stringify(candidate.documents),
        qualificationProfile: JSON.stringify(candidate.qualificationProfile)
      })
    }
  }

  if (jobCount === 0) {
    const insertJob = db.prepare(`
      INSERT INTO jobs (
        id, title, department, description, location, required_skills,
        required_experience, required_education, salary_range, status,
        created_at, updated_at
      ) VALUES (
        @id, @title, @department, @description, @location, @requiredSkills,
        @requiredExperience, @requiredEducation, @salaryRange, @status,
        @createdAt, @updatedAt
      )
    `)

    for (const job of testJobs) {
      insertJob.run({
        ...job,
        requiredSkills: JSON.stringify(job.requiredSkills),
        salaryRange: JSON.stringify(job.salaryRange)
      })
    }
  }

  if (userCount === 0) {
    db.prepare(`
      INSERT INTO users (id, username, password, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      '1',
      'admin',
      'admin123', // In Produktion sollte das gehashed sein!
      'admin',
      new Date().toISOString(),
      new Date().toISOString()
    )
  }

  console.log('Migration erfolgreich durchgeführt!')
}

// Führe die Migration aus
try {
  migrate()
} catch (error) {
  console.error('Fehler bei der Migration:', error)
}