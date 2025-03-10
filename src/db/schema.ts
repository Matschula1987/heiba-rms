import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const candidates = sqliteTable('candidates', {
  id: text('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  mobile: text('mobile'),
  dateOfBirth: text('date_of_birth'),
  position: text('position').notNull(),
  location: text('location').notNull(),
  address: text('address').notNull(), // JSON string
  skills: text('skills').notNull(), // JSON array
  experience: integer('experience').notNull(),
  education: text('education').notNull(),
  salaryExpectation: integer('salary_expectation'),
  status: text('status').notNull(),
  source: text('source').notNull(),
  applicationDate: text('application_date').notNull(),
  documents: text('documents'), // JSON array
  qualificationProfile: text('qualification_profile'), // JSON object
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export const jobs = sqliteTable('jobs', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  department: text('department').notNull(),
  description: text('description').notNull(),
  location: text('location').notNull(),
  requiredSkills: text('required_skills').notNull(), // JSON array
  requiredExperience: integer('required_experience').notNull(),
  requiredEducation: text('required_education').notNull(),
  salaryRange: text('salary_range'), // JSON object
  status: text('status').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(), // Gehashed
  role: text('role').notNull(), // admin, recruiter, viewer
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})