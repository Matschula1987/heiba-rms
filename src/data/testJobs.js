const testJobs = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    description: 'Wir suchen einen erfahrenen Frontend-Entwickler für unser Webteam.',
    location: 'Mannheim',
    requiredSkills: ['React', 'TypeScript', 'CSS', 'HTML', 'JavaScript'],
    requiredExperience: 5,
    requiredEducation: 'Bachelor Informatik',
    salaryRange: {
      min: 65000,
      max: 85000
    },
    status: 'active',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z'
  },
  // ... weitere Testdaten wie gehabt
]

module.exports = { testJobs }