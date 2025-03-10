import { db } from './index'
import { candidates, jobs, users } from './schema'
import { testCandidates } from '@/data/testCandidates'
import { testJobs } from '@/data/testJobs'
import { stringifyJsonFields } from './index'
import { sql } from 'drizzle-orm'

export async function migrate() {
  // Erstelle Tabellen
  db.run(sql`
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

  db.run(sql`
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

  db.run(sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  // Füge Testdaten ein
  const candidateCount = db.select().from(candidates).all().length
  if (candidateCount === 0) {
    for (const candidate of testCandidates) {
      db.insert(candidates).values(stringifyJsonFields(candidate)).run()
    }
  }

  const jobCount = db.select().from(jobs).all().length
  if (jobCount === 0) {
    for (const job of testJobs) {
      db.insert(jobs).values(stringifyJsonFields(job)).run()
    }
  }

  // Erstelle einen Admin-Benutzer
  const userCount = db.select().from(users).all().length
  if (userCount === 0) {
    db.insert(users).values({
      id: '1',
      username: 'admin',
      password: 'admin123', // In Produktion sollte das gehashed sein!
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).run()
  }
}

// Führe die Migration aus
migrate().catch(console.error)