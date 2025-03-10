import { Job } from '@/types'

// Vereinfachte Dummy-Jobs für das Matching
export const dummyJobs: Job[] = [
  {
    id: 'job1',
    company_id: 1,
    title: 'Frontend Developer',
    description: 'Wir suchen einen Frontend-Entwickler für unser Webteam.',
    location: 'Mannheim',
    salary_range: '55000-70000',
    job_type: 'Vollzeit',
    requirements: 'Mindestens 3 Jahre Erfahrung mit React, JavaScript und CSS. Bachelor in Informatik bevorzugt.',
    department: 'Engineering',
    status: 'active',
    skills: [
      { name: 'React', level: 4 },
      { name: 'JavaScript', level: 4 },
      { name: 'CSS', level: 3 },
      { name: 'HTML', level: 4 }
    ],
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z'
  },
  {
    id: 'job2',
    company_id: 1,
    title: 'Backend Entwickler',
    description: 'Backend-Entwickler mit Erfahrung in Mikroservices gesucht.',
    location: 'Remote',
    salary_range: '60000-80000',
    job_type: 'Vollzeit',
    requirements: 'Mindestens 4 Jahre Erfahrung mit Node.js, ExpressJS und MongoDB. Kenntnisse in Microservices-Architekturen.',
    department: 'Engineering',
    status: 'active',
    skills: [
      { name: 'Node.js', level: 5 },
      { name: 'Express', level: 4 },
      { name: 'MongoDB', level: 4 },
      { name: 'Microservices', level: 3 }
    ],
    created_at: '2024-02-03T10:00:00Z',
    updated_at: '2024-02-03T10:00:00Z'
  },
  {
    id: 'job3',
    company_id: 1,
    title: 'DevOps Engineer',
    description: 'DevOps Engineer für Infrastruktur und Automatisierung.',
    location: 'Heidelberg',
    salary_range: '65000-85000',
    job_type: 'Vollzeit',
    requirements: '3+ Jahre Erfahrung mit Docker, Kubernetes, CI/CD. Kenntnisse in AWS oder Azure.',
    department: 'Operations',
    status: 'active',
    skills: [
      { name: 'Docker', level: 5 },
      { name: 'Kubernetes', level: 4 },
      { name: 'AWS', level: 3 },
      { name: 'CI/CD', level: 4 }
    ],
    created_at: '2024-02-05T10:00:00Z',
    updated_at: '2024-02-05T10:00:00Z'
  },
  {
    id: 'job4',
    company_id: 1,
    title: 'Data Scientist',
    description: 'Data Scientist mit Erfahrung in ML und Python.',
    location: 'Stuttgart',
    salary_range: '70000-90000',
    job_type: 'Vollzeit',
    requirements: 'Master oder PhD in Data Science oder verwandtem Bereich. 3+ Jahre Erfahrung mit ML-Frameworks und Python.',
    department: 'Data Science',
    status: 'active',
    skills: [
      { name: 'Python', level: 5 },
      { name: 'TensorFlow', level: 4 },
      { name: 'PyTorch', level: 3 },
      { name: 'SQL', level: 4 },
      { name: 'Machine Learning', level: 5 }
    ],
    created_at: '2024-02-10T10:00:00Z',
    updated_at: '2024-02-10T10:00:00Z'
  },
  {
    id: 'job5',
    company_id: 1,
    title: 'UX/UI Designer',
    description: 'UX/UI Designer für Produktdesign und Benutzerforschung.',
    location: 'Mannheim',
    salary_range: '50000-65000',
    job_type: 'Vollzeit',
    requirements: 'Mind. 2 Jahre Erfahrung in UX/UI Design. Kenntnisse in Figma, Adobe XD. Erfahrung mit Userresearch.',
    department: 'Design',
    status: 'active',
    skills: [
      { name: 'Figma', level: 5 },
      { name: 'Adobe XD', level: 4 },
      { name: 'User Research', level: 3 },
      { name: 'Wireframing', level: 4 },
      { name: 'Prototyping', level: 4 }
    ],
    created_at: '2024-02-15T10:00:00Z',
    updated_at: '2024-02-15T10:00:00Z'
  }
]
