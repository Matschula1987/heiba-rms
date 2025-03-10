import { Candidate } from '@/types'

export const testCandidates: Candidate[] = [
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
    status: 'in_review',
    source: 'talent360',
    applicationDate: '2024-02-15',
    documents: [
      {
        type: 'cv',
        name: 'Lebenslauf_Mustermann.pdf',
        url: '/documents/cv_1.pdf'
      },
      {
        type: 'cover_letter',
        name: 'Anschreiben_Mustermann.pdf',
        url: '/documents/cover_1.pdf'
      }
    ],
    qualificationProfile: {
      skills: [
        { name: 'JavaScript', level: 'advanced' },
        { name: 'TypeScript', level: 'advanced' },
        { name: 'React', level: 'advanced' },
        { name: 'Node.js', level: 'intermediate' },
        { name: 'AWS', level: 'intermediate' }
      ],
      experience: [
        {
          position: 'Senior Software Engineer',
          company: 'Tech GmbH',
          startDate: '2020-01',
          endDate: null,
          description: 'Leitung des Frontend-Teams, Entwicklung von React-Anwendungen'
        },
        {
          position: 'Software Engineer',
          company: 'Digital AG',
          startDate: '2016-03',
          endDate: '2019-12',
          description: 'Fullstack-Entwicklung mit Node.js und React'
        }
      ],
      education: [
        {
          degree: 'Master Informatik',
          institution: 'Universität Mannheim',
          startDate: '2014',
          endDate: '2016',
          description: 'Schwerpunkt: Softwareentwicklung und Künstliche Intelligenz'
        },
        {
          degree: 'Bachelor Informatik',
          institution: 'DHBW Mannheim',
          startDate: '2011',
          endDate: '2014',
          description: 'Duales Studium in Kooperation mit SAP'
        }
      ],
      languages: [
        { language: 'Deutsch', level: 'native' },
        { language: 'Englisch', level: 'C1' }
      ]
    },
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
    skills: ['Marketing Strategy', 'Social Media', 'Content Marketing', 'SEO', 'Analytics'],
    experience: 10,
    education: 'Master Marketing',
    salaryExpectation: 65000,
    status: 'interview',
    source: 'manual',
    applicationDate: '2024-02-10',
    documents: [
      {
        type: 'cv',
        name: 'CV_Schmidt_2024.pdf',
        url: '/documents/cv_2.pdf'
      }
    ],
    qualificationProfile: {
      skills: [
        { name: 'Marketing Strategy', level: 'advanced' },
        { name: 'Social Media', level: 'advanced' },
        { name: 'Content Marketing', level: 'advanced' },
        { name: 'SEO', level: 'intermediate' },
        { name: 'Analytics', level: 'intermediate' }
      ],
      experience: [
        {
          position: 'Senior Marketing Manager',
          company: 'Marketing Pro GmbH',
          startDate: '2019-06',
          endDate: null,
          description: 'Leitung des Digital Marketing Teams'
        },
        {
          position: 'Marketing Manager',
          company: 'Online AG',
          startDate: '2014-03',
          endDate: '2019-05',
          description: 'Verantwortlich für Social Media und Content Marketing'
        }
      ],
      education: [
        {
          degree: 'Master Marketing',
          institution: 'Universität Mannheim',
          startDate: '2012',
          endDate: '2014',
          description: 'Schwerpunkt: Digital Marketing'
        }
      ],
      languages: [
        { language: 'Deutsch', level: 'native' },
        { language: 'Englisch', level: 'C2' },
        { language: 'Französisch', level: 'B2' }
      ]
    },
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
    skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Data Visualization'],
    experience: 3,
    education: 'Master Data Science',
    salaryExpectation: 60000,
    status: 'new',
    source: 'talent360',
    applicationDate: '2024-02-16',
    documents: [
      {
        type: 'cv',
        name: 'CV_Weber.pdf',
        url: '/documents/cv_3.pdf'
      },
      {
        type: 'certificates',
        name: 'Zertifikate_Weber.pdf',
        url: '/documents/cert_3.pdf'
      }
    ],
    qualificationProfile: {
      skills: [
        { name: 'Python', level: 'advanced' },
        { name: 'Machine Learning', level: 'intermediate' },
        { name: 'SQL', level: 'advanced' },
        { name: 'TensorFlow', level: 'intermediate' },
        { name: 'Data Visualization', level: 'intermediate' }
      ],
      experience: [
        {
          position: 'Junior Data Scientist',
          company: 'AI Solutions GmbH',
          startDate: '2021-01',
          endDate: null,
          description: 'Entwicklung von ML-Modellen für Kundenanalysen'
        }
      ],
      education: [
        {
          degree: 'Master Data Science',
          institution: 'TU Darmstadt',
          startDate: '2019',
          endDate: '2020',
          description: 'Schwerpunkt: Machine Learning und Big Data'
        }
      ],
      languages: [
        { language: 'Deutsch', level: 'native' },
        { language: 'Englisch', level: 'C1' }
      ]
    },
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
    skills: ['Recruiting', 'Employee Relations', 'Talent Management', 'SAP HR', 'Arbeitsrecht'],
    experience: 6,
    education: 'Bachelor BWL',
    salaryExpectation: 55000,
    status: 'offer',
    source: 'manual',
    applicationDate: '2024-02-01',
    documents: [
      {
        type: 'cv',
        name: 'Lebenslauf_Meyer.pdf',
        url: '/documents/cv_4.pdf'
      },
      {
        type: 'certificates',
        name: 'Zertifikate_Meyer.pdf',
        url: '/documents/cert_4.pdf'
      }
    ],
    qualificationProfile: {
      skills: [
        { name: 'Recruiting', level: 'advanced' },
        { name: 'Employee Relations', level: 'advanced' },
        { name: 'Talent Management', level: 'intermediate' },
        { name: 'SAP HR', level: 'intermediate' },
        { name: 'Arbeitsrecht', level: 'intermediate' }
      ],
      experience: [
        {
          position: 'HR Manager',
          company: 'Personal GmbH',
          startDate: '2018-04',
          endDate: null,
          description: 'Verantwortlich für Recruiting und Personalentwicklung'
        },
        {
          position: 'HR Assistant',
          company: 'Industrie AG',
          startDate: '2016-09',
          endDate: '2018-03',
          description: 'Unterstützung im Recruiting und Onboarding'
        }
      ],
      education: [
        {
          degree: 'Bachelor BWL',
          institution: 'FH Ludwigshafen',
          startDate: '2013',
          endDate: '2016',
          description: 'Schwerpunkt: Personal und Organisation'
        }
      ],
      languages: [
        { language: 'Deutsch', level: 'native' },
        { language: 'Englisch', level: 'B2' }
      ]
    },
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
    dateOfBirth: '1987-07-03',
    position: 'Sales Manager',
    location: 'Mannheim',
    address: {
      street: 'Augustaanlage',
      houseNumber: '32',
      postalCode: '68165',
      city: 'Mannheim',
      country: 'Deutschland'
    },
    skills: ['B2B Sales', 'CRM', 'Verhandlungsführung', 'Präsentation', 'Account Management'],
    experience: 12,
    education: 'Bachelor Wirtschaftswissenschaften',
    salaryExpectation: 80000,
    status: 'rejected',
    source: 'talent360',
    applicationDate: '2024-01-20',
    documents: [
      {
        type: 'cv',
        name: 'CV_Bauer_2024.pdf',
        url: '/documents/cv_5.pdf'
      },
      {
        type: 'cover_letter',
        name: 'Anschreiben_Bauer.pdf',
        url: '/documents/cover_5.pdf'
      }
    ],
    qualificationProfile: {
      skills: [
        { name: 'B2B Sales', level: 'advanced' },
        { name: 'CRM', level: 'advanced' },
        { name: 'Verhandlungsführung', level: 'advanced' },
        { name: 'Präsentation', level: 'advanced' },
        { name: 'Account Management', level: 'intermediate' }
      ],
      experience: [
        {
          position: 'Senior Sales Manager',
          company: 'Solutions GmbH',
          startDate: '2016-01',
          endDate: null,
          description: 'Verantwortlich für Großkunden im B2B-Bereich'
        },
        {
          position: 'Account Manager',
          company: 'Business AG',
          startDate: '2012-06',
          endDate: '2015-12',
          description: 'Betreuung von Bestandskunden und Neukundenakquise'
        }
      ],
      education: [
        {
          degree: 'Bachelor Wirtschaftswissenschaften',
          institution: 'Universität Mannheim',
          startDate: '2008',
          endDate: '2011',
          description: 'Schwerpunkt: Marketing und Vertrieb'
        }
      ],
      languages: [
        { language: 'Deutsch', level: 'native' },
        { language: 'Englisch', level: 'C1' },
        { language: 'Spanisch', level: 'B1' }
      ]
    },
    createdAt: '2024-01-20T16:20:00Z',
    updatedAt: '2024-01-20T16:20:00Z'
  }
]