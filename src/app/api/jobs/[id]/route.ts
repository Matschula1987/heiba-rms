import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { ensureDbInitializedForApi } from '@/app/api/initDb'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await ensureDbInitializedForApi();
    const db = await getDb();
    
    const job = await db.get(`
      SELECT 
        j.*,
        COUNT(ja.id) as applications_count
      FROM jobs j
      LEFT JOIN job_applications ja ON j.id = ja.job_id
      WHERE j.id = ?
      GROUP BY j.id
    `, params.id);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = await getDb();
    const body = await request.json();
    const {
      title,
      description,
      company,
      location,
      salary_range,
      job_type,
      requirements,
      department,
      status
    } = body;

    await db.run(`
      UPDATE jobs
      SET 
        title = ?,
        description = ?,
        company = ?,
        location = ?,
        salary_range = ?,
        job_type = ?,
        requirements = ?,
        department = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, title, description, company, location, salary_range, job_type, requirements, department, status, params.id);

    return NextResponse.json({ id: params.id, ...body });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = await getDb();
    await db.run('DELETE FROM jobs WHERE id = ?', params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
