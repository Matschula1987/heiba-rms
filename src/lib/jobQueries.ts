import { getDb } from './db';
import type { Job } from '@/types';

export const jobQueries = {
  async createJob(data: Partial<Job>, companyId: number): Promise<string> {
    const db = await getDb();
    
    const result = await db.run(`
      INSERT INTO jobs (
        company_id, 
        title, 
        description, 
        location, 
        salary_range, 
        job_type, 
        requirements, 
        department, 
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      companyId,
      data.title,
      data.description,
      data.location,
      data.salary_range,
      data.job_type,
      data.requirements,
      data.department,
      data.status || 'draft'
    ]);

    if (data.skills?.length) {
      const skillValues = data.skills.map(skill => 
        `(?, ?, ?, 1)`
      ).join(',');

      await db.run(`
        INSERT INTO job_skills (job_id, skill_name, required_level, is_required)
        VALUES ${skillValues}
      `, data.skills.flatMap(skill => [result.lastID, skill.name, skill.level || 3]));
    }

    return result.lastID;
  },

  async searchJobs(params: {
    companyId: number;
    searchTerm?: string;
    status?: string;
    department?: string;
  }): Promise<Job[]> {
    const db = await getDb();
    let query = `
      SELECT 
        j.*, 
        COUNT(DISTINCT a.id) as applications_count,
        GROUP_CONCAT(DISTINCT js.skill_name) as skills
      FROM jobs j
      LEFT JOIN job_applications a ON j.id = a.job_id
      LEFT JOIN job_skills js ON j.id = js.job_id
      WHERE j.company_id = ?
    `;
    const values: any[] = [params.companyId];

    if (params.searchTerm) {
      query += ` AND (
        j.title LIKE ? OR 
        j.description LIKE ? OR 
        j.location LIKE ? OR
        js.skill_name LIKE ?
      )`;
      const searchTerm = `%${params.searchTerm}%`;
      values.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (params.status && params.status !== 'all') {
      query += ` AND j.status = ?`;
      values.push(params.status);
    }

    if (params.department) {
      query += ` AND j.department = ?`;
      values.push(params.department);
    }

    query += ` 
      GROUP BY j.id 
      ORDER BY j.created_at DESC
    `;

    const jobs = await db.all(query, values);
    
    // Expliziter Typ für job
    return jobs.map((job: any) => ({
      ...job,
      skills: job.skills ? job.skills.split(',') : []
    }));
  },

  async getJobById(id: string): Promise<Job | null> {
    const db = await getDb();
    const job = await db.get(`
      SELECT 
        j.*, 
        COUNT(DISTINCT a.id) as applications_count,
        GROUP_CONCAT(DISTINCT js.skill_name) as skills
      FROM jobs j
      LEFT JOIN job_applications a ON j.id = a.job_id
      LEFT JOIN job_skills js ON j.id = js.job_id
      WHERE j.id = ?
      GROUP BY j.id
    `, [id]);

    if (!job) return null;

    return {
      ...job,
      skills: job.skills ? job.skills.split(',') : []
    };
  }
};
