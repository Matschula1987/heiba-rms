const testCandidates = [
  {
    id: '1',
    firstName: 'Max',
    lastName: 'Mustermann',
    email: 'max.mustermann@example.com',
    phone: '0621-12345',
    mobile: '0170-1234567',
    dateOfBirth: '1990-05-15',
    position: 'Senior Software Engineer',
    location: 'Mannheim',
    address: {
      street: 'Musterstraße',
      houseNumber: '42',
      postalCode: '68159',
      city: 'Mannheim',
      country: 'Deutschland'
    },
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS'],
    experience: 8,
    education: 'Master Informatik',
    salaryExpectation: 75000,
    status: 'active',
    source: 'manual',
    applicationDate: '2024-02-15',
    documents: [
      {
        type: 'cv',
        name: 'Lebenslauf_Mustermann.pdf',
        url: '/documents/cv_1.pdf'
      }
    ],
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z'
  },
  {
    id: '2',
    firstName: 'Anna',
    lastName: 'Schmidt',
    email: 'anna.schmidt@example.com',
    phone: '0621-54321',
    mobile: '0170-7654321',
    dateOfBirth: '1988-08-23',
    position: 'Marketing Manager',
    location: 'Heidelberg',
    address: {
      street: 'Hauptstraße',
      houseNumber: '123',
      postalCode: '69115',
      city: 'Heidelberg',
      country: 'Deutschland'
    },
    skills: ['Marketing Strategy', 'Social Media', 'Content Marketing', 'SEO'],
    experience: 6,
    education: 'Bachelor Marketing',
    salaryExpectation: 65000,
    status: 'active',
    source: 'manual',
    applicationDate: '2024-02-10',
    documents: [],
    createdAt: '2024-02-10T14:30:00Z',
    updatedAt: '2024-02-10T14:30:00Z'
  },
  {
    id: '3',
    firstName: 'Thomas',
    lastName: 'Weber',
    email: 'thomas.weber@example.com',
    phone: '0621-98765',
    mobile: '0170-9876543',
    dateOfBirth: '1995-03-10',
    position: 'Data Scientist',
    location: 'Mannheim',
    address: {
      street: 'Wasserturmplatz',
      houseNumber: '5',
      postalCode: '68161',
      city: 'Mannheim',
      country: 'Deutschland'
    },
    skills: ['Python', 'Machine Learning', 'SQL', 'Data Analysis'],
    experience: 3,
    education: 'Master Data Science',
    salaryExpectation: 60000,
    status: 'active',
    source: 'manual',
    applicationDate: '2024-02-16',
    documents: [],
    createdAt: '2024-02-16T09:15:00Z',
    updatedAt: '2024-02-16T09:15:00Z'
  },
  {
    id: '4',
    firstName: 'Laura',
    lastName: 'Meyer',
    email: 'laura.meyer@example.com',
    phone: '0621-45678',
    mobile: '0170-4567890',
    dateOfBirth: '1992-11-28',
    position: 'HR Manager',
    location: 'Ludwigshafen',
    address: {
      street: 'Rheinstraße',
      houseNumber: '78',
      postalCode: '67059',
      city: 'Ludwigshafen',
      country: 'Deutschland'
    },
    skills: ['Recruiting', 'Employee Relations', 'Arbeitsrecht', 'SAP HR'],
    experience: 5,
    education: 'Bachelor BWL',
    salaryExpectation: 55000,
    status: 'active',
    source: 'manual',
    applicationDate: '2024-02-01',
    documents: [],
    createdAt: '2024-02-01T11:45:00Z',
    updatedAt: '2024-02-01T11:45:00Z'
  },
  {
    id: '5',
    firstName: 'Michael',
    lastName: 'Bauer',
    email: 'michael.bauer@example.com',
    phone: '0621-36925',
    mobile: '0170-1472583',
    position: 'Sales Manager',
    location: 'Mannheim',
    address: {
      street: 'Augustaanlage',
      houseNumber: '32',
      postalCode: '68165',
      city: 'Mannheim',
      country: 'Deutschland'
    },
    skills: ['B2B Sales', 'CRM', 'Verhandlungsführung', 'Account Management'],
    experience: 7,
    education: 'Bachelor Wirtschaftswissenschaften',
    salaryExpectation: 70000,
    status: 'active',
    source: 'manual',
    applicationDate: '2024-01-20',
    documents: [],
    createdAt: '2024-01-20T16:20:00Z',
    updatedAt: '2024-01-20T16:20:00Z'
  },
  {
    id: '6',
    firstName: 'Julia',
    lastName: 'Koch',
    email: 'julia.koch@example.com',
    phone: '0621-78945',
    mobile: '0170-7894561',
    position: 'Product Manager',
    location: 'Heidelberg',
    address: {
      street: 'Sofienstraße',
      houseNumber: '15',
      postalCode: '69115',
      city: 'Heidelberg',
      country: 'Deutschland'
    },
    skills: ['Product Management', 'Agile', 'SCRUM', 'User Research'],
    experience: 4,
    education: 'Master Wirtschaftsinformatik',
    salaryExpectation: 65000,
    status: 'active',
    source: 'manual',
    applicationDate: '2024-02-05',
    documents: [],
    createdAt: '2024-02-05T13:20:00Z',
    updatedAt: '2024-02-05T13:20:00Z'
  },
  {
    id: '7',
    firstName: 'Stefan',
    lastName: 'Wagner',
    email: 'stefan.wagner@example.com',
    phone: '0621-95175',
    mobile: '0170-9517536',
    position: 'System Administrator',
    location: 'Mannheim',
    address: {
      street: 'Käfertaler Straße',
      houseNumber: '190',
      postalCode: '68167',
      city: 'Mannheim',
      country: 'Deutschland'
    },
    skills: ['Linux', 'Windows Server', 'Network Security', 'Cloud Infrastructure'],
    experience: 6,
    education: 'Bachelor Informatik',
    salaryExpectation: 58000,
    status: 'active',
    source: 'manual',
    applicationDate: '2024-02-08',
    documents: [],
    createdAt: '2024-02-08T09:45:00Z',
    updatedAt: '2024-02-08T09:45:00Z'
  },
  {
    id: '8',
    firstName: 'Sarah',
    lastName: 'Fischer',
    email: 'sarah.fischer@example.com',
    phone: '0621-36914',
    mobile: '0170-3691478',
    position: 'UX Designer',
    location: 'Heidelberg',
    address: {
      street: 'Bergheimer Straße',
      houseNumber: '45',
      postalCode: '69115',
      city: 'Heidelberg',
      country: 'Deutschland'
    },
    skills: ['UI Design', 'User Research', 'Figma', 'Adobe XD'],
    experience: 3,
    education: 'Bachelor Mediendesign',
    salaryExpectation: 52000,
    status: 'active',
    source: 'manual',
    applicationDate: '2024-02-12',
    documents: [],
    createdAt: '2024-02-12T14:30:00Z',
    updatedAt: '2024-02-12T14:30:00Z'
  },
  {
    id: '9',
    firstName: 'Daniel',
    lastName: 'Hoffmann',
    email: 'daniel.hoffmann@example.com',
    phone: '0621-25836',
    mobile: '0170-2583691',
    position: 'Backend Developer',
    location: 'Mannheim',
    address: {
      street: 'Seckenheimer Straße',
      houseNumber: '72',
      postalCode: '68167',
      city: 'Mannheim',
      country: 'Deutschland'
    },
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker'],
    experience: 5,
    education: 'Master Informatik',
    salaryExpectation: 68000,
    status: 'active',
    source: 'manual',
    applicationDate: '2024-02-14',
    documents: [],
    createdAt: '2024-02-14T11:15:00Z',
    updatedAt: '2024-02-14T11:15:00Z'
  },
  {
    id: '10',
    firstName: 'Lisa',
    lastName: 'Schneider',
    email: 'lisa.schneider@example.com',
    phone: '0621-14725',
    mobile: '0170-1472583',
    position: 'Content Manager',
    location: 'Heidelberg',
    address: {
      street: 'Rohrbacher Straße',
      houseNumber: '12',
      postalCode: '69115',
      city: 'Heidelberg',
      country: 'Deutschland'
    },
    skills: ['Content Strategy', 'Copywriting', 'SEO', 'Social Media'],
    experience: 4,
    education: 'Bachelor Medienkommunikation',
    salaryExpectation: 48000,
    status: 'active',
    source: 'manual',
    applicationDate: '2024-02-18',
    documents: [],
    createdAt: '2024-02-18T10:00:00Z',
    updatedAt: '2024-02-18T10:00:00Z'
  }
];

module.exports = { testCandidates };