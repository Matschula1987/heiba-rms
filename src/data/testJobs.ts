import { Job } from '@/types'

export const testJobs: Job[] = [
  {
    id: '1',
    company_id: 1,
    title: 'Senior Frontend Developer',
    description: 'Wir suchen einen erfahrenen Frontend-Entwickler für unser Webteam.',
    location: 'Mannheim',
    salary_range: '65000-85000',
    job_type: 'Vollzeit',
    requirements: 'Mindestens 5 Jahre Erfahrung mit React, TypeScript, CSS, HTML und JavaScript. Erfahrung mit modernen Frontend-Workflows und Build-Tools. Bachelor in Informatik oder verwandtem Bereich.',
    department: 'Engineering',
    status: 'active',
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
    skills: [
      { name: 'React', level: 5 },
      { name: 'TypeScript', level: 4 },
      { name: 'CSS', level: 4 },
      { name: 'HTML', level: 5 },
      { name: 'JavaScript', level: 5 }
    ]
  },
  {
    id: '2',
    company_id: 1,
    title: 'UX/UI Designer',
    description: 'Gestalte Benutzererfahrungen, die unsere Kunden lieben werden.',
    location: 'Remote',
    requiredEducation: 'Bachelor Marketing',
    salaryRange: {
      min: 45000,
      max: 60000
    },
    status: 'active',
    portals: [],
    applications: [],
    createdAt: '2024-02-05T10:00:00Z',
    updatedAt: '2024-02-05T10:00:00Z'
  },
  {
    id: '3',
    title: 'Data Scientist',
    department: 'Analytics',
    description: 'Data Scientist für Machine Learning Projekte gesucht.',
    location: 'Mannheim',
    requiredSkills: ['Python', 'Machine Learning', 'SQL', 'Data Analysis'],
    requiredExperience: 2,
    requiredEducation: 'Master Data Science',
    salaryRange: {
      min: 55000,
      max: 70000
    },
    status: 'active',
    portals: [],
    applications: [],
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-02-10T10:00:00Z'
  },
  {
    id: '4',
    title: 'HR Manager',
    department: 'Human Resources',
    description: 'HR Manager für Recruiting und Personalentwicklung.',
    location: 'Ludwigshafen',
    requiredSkills: ['Recruiting', 'Employee Relations', 'Arbeitsrecht', 'SAP HR'],
    requiredExperience: 4,
    requiredEducation: 'Bachelor BWL',
    salaryRange: {
      min: 50000,
      max: 65000
    },
    status: 'active',
    portals: [],
    applications: [],
    createdAt: '2024-02-12T10:00:00Z',
    updatedAt: '2024-02-12T10:00:00Z'
  },
  {
    id: '5',
    title: 'Sales Manager',
    department: 'Sales',
    description: 'Erfahrener Sales Manager für B2B-Vertrieb.',
    location: 'Mannheim',
    requiredSkills: ['B2B Sales', 'CRM', 'Verhandlungsführung', 'Account Management'],
    requiredExperience: 5,
    requiredEducation: 'Bachelor Wirtschaft',
    salaryRange: {
      min: 60000,
      max: 80000
    },
    status: 'active',
    portals: [],
    applications: [],
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z'
  }
]