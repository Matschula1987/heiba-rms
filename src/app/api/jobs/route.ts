import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { ensureDbInitializedForApi } from '@/app/api/initDb'

export async function GET() {
  try {
    // Stelle sicher, dass die Datenbank initialisiert ist
    await ensureDbInitializedForApi()
    const db = await getDb()
    const jobs = await db.all(`
      SELECT 
        j.*,
        COUNT(ja.id) as applications_count
      FROM jobs j
      LEFT JOIN job_applications ja ON j.id = ja.job_id
      GROUP BY j.id
      ORDER BY j.created_at DESC
    `)
    
    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Stelle sicher, dass die Datenbank initialisiert ist
    await ensureDbInitializedForApi()
    const db = await getDb()
    const body = await request.json()
    const {
      title,
      description,
      company,
      location,
      salary_range,
      job_type,
      requirements,
      department,
      status = 'draft'
    } = body

    const result = await db.run(`
      INSERT INTO jobs (
        title,
        description,
        company,
        location,
        salary_range,
        job_type,
        requirements,
        department,
        status
      ) VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
      )
    `, title, description, company, location, salary_range, job_type, requirements, department, status)

    // Hole die ID der neu eingefügten Stelle
    const newJob = await db.get('SELECT * FROM jobs WHERE rowid = ?', result.lastID)
    
    return NextResponse.json(newJob)
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
