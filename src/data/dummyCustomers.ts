import { Customer, Contact, CustomerAddress } from '@/types/customer';

/**
 * Beispieldaten für Kunden und Interessenten
 * Diese Daten werden verwendet, wenn die API nicht verfügbar ist
 */

export const dummyCustomers: Customer[] = [
  {
    id: 'cust1',
    name: 'TechSolutions GmbH',
    type: 'customer',
    status: 'active',
    industry: 'IT & Software',
    website: 'https://techsolutions-beispiel.de',
    contactCount: 2,
    requirementCount: 3,
    address: {
      street: 'Technikstraße 42',
      city: 'Berlin',
      postalCode: '10115',
      country: 'Deutschland'
    } as CustomerAddress,
    notes: 'Langjähriger Kunde mit Schwerpunkt in der Softwareentwicklung. Sucht regelmäßig nach Frontend- und Backend-Entwicklern.',
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2024-02-20T14:30:00Z'
  },
  {
    id: 'cust2',
    name: 'Mustermann AG',
    type: 'customer',
    status: 'active',
    industry: 'Fertigung',
    website: 'https://mustermann-ag.de',
    contactCount: 1,
    requirementCount: 2,
    address: {
      street: 'Industrieweg 10',
      city: 'Hamburg',
      postalCode: '20095',
      country: 'Deutschland'
    } as CustomerAddress,
    notes: 'Fertigungsunternehmen mit regelmäßigem Bedarf an technischen Fachkräften und Ingenieuren.',
    createdAt: '2023-03-20T08:15:00Z',
    updatedAt: '2024-01-10T11:45:00Z'
  },
  {
    id: 'cust3',
    name: 'Innovate Startup',
    type: 'prospect',
    status: 'prospect',
    industry: 'Technologie',
    website: 'https://innovate-startup.de',
    contactCount: 1,
    requirementCount: 0,
    address: {
      street: 'Startup Allee 5',
      city: 'München',
      postalCode: '80331',
      country: 'Deutschland'
    } as CustomerAddress,
    notes: 'Junges Unternehmen mit innovativem KI-Produkt. Hat Interesse an Entwicklern mit ML-Erfahrung geäußert.',
    createdAt: '2024-01-05T14:20:00Z',
    updatedAt: '2024-02-15T09:30:00Z'
  },
  {
    id: 'cust4',
    name: 'FinanzDirekt AG',
    type: 'customer',
    status: 'inactive',
    industry: 'Finanzen',
    website: 'https://finanzdirekt.de',
    contactCount: 1,
    requirementCount: 0,
    address: {
      street: 'Bankenplatz 7',
      city: 'Frankfurt',
      postalCode: '60311',
      country: 'Deutschland'
    } as CustomerAddress,
    notes: 'Finanzdienstleister, momentan keine aktiven Stellen. Letzter Kontakt vor 8 Monaten.',
    createdAt: '2022-06-10T09:00:00Z',
    updatedAt: '2023-08-22T16:15:00Z'
  },
  {
    id: 'cust5',
    name: 'Gesundheit Plus',
    type: 'prospect',
    status: 'prospect',
    industry: 'Gesundheitswesen',
    website: 'https://gesundheit-plus.de',
    contactCount: 1,
    requirementCount: 1,
    address: {
      street: 'Klinikstraße 23',
      city: 'Köln',
      postalCode: '50667',
      country: 'Deutschland'
    } as CustomerAddress,
    notes: 'Betreiber mehrerer Kliniken, interessiert an medizinischem Fachpersonal und IT-Spezialisten für Gesundheitssysteme.',
    createdAt: '2023-11-20T13:45:00Z',
    updatedAt: '2024-02-28T10:20:00Z'
  }
];

export const dummyContacts: { [customerId: string]: Contact[] } = {
  'cust1': [
    {
      id: 'cont1',
      customerId: 'cust1',
      firstName: 'Max',
      lastName: 'Müller',
      position: 'HR Manager',
      department: 'Personal',
      email: 'max.mueller@techsolutions-beispiel.de',
      phone: '+49123456789',
      mobile: '+49987654321',
      isMainContact: true,
      notes: 'Hauptansprechpartner für Recruitingfragen',
      createdAt: '2023-01-15T10:00:00Z',
      updatedAt: '2023-06-20T14:30:00Z'
    },
    {
      id: 'cont2',
      customerId: 'cust1',
      firstName: 'Laura',
      lastName: 'Schmidt',
      position: 'CTO',
      department: 'Technische Leitung',
      email: 'l.schmidt@techsolutions-beispiel.de',
      phone: '+49123456780',
      mobile: undefined,
      isMainContact: false,
      notes: 'Technische Ansprechpartnerin, nimmt an Interviews teil',
      createdAt: '2023-02-10T09:15:00Z',
      updatedAt: '2023-05-15T11:30:00Z'
    }
  ],
  'cust2': [
    {
      id: 'cont3',
      customerId: 'cust2',
      firstName: 'Thomas',
      lastName: 'Weber',
      position: 'Personalleiter',
      department: 'HR',
      email: 'weber@mustermann-ag.de',
      phone: '+4955557777',
      mobile: '+49444433333',
      isMainContact: true,
      notes: 'Verantwortlich für alle Personalentscheidungen',
      createdAt: '2023-03-20T08:15:00Z',
      updatedAt: '2023-08-05T15:45:00Z'
    }
  ],
  'cust3': [
    {
      id: 'cont4',
      customerId: 'cust3',
      firstName: 'Sarah',
      lastName: 'Fischer',
      position: 'Gründerin & CEO',
      department: 'Geschäftsführung',
      email: 'sarah@innovate-startup.de',
      phone: '+49111222333',
      mobile: '+49111222334',
      isMainContact: true,
      notes: 'Direkte Ansprechpartnerin, trifft alle Entscheidungen',
      createdAt: '2024-01-05T14:20:00Z',
      updatedAt: '2024-01-05T14:20:00Z'
    }
  ],
  'cust4': [
    {
      id: 'cont5',
      customerId: 'cust4',
      firstName: 'Michael',
      lastName: 'Keller',
      position: 'Abteilungsleiter IT',
      department: 'IT',
      email: 'keller@finanzdirekt.de',
      phone: '+4966778899',
      mobile: undefined,
      isMainContact: true,
      notes: 'Zuständig für IT-Recruiting',
      createdAt: '2022-06-10T09:00:00Z',
      updatedAt: '2022-11-15T14:20:00Z'
    }
  ],
  'cust5': [
    {
      id: 'cont6',
      customerId: 'cust5',
      firstName: 'Julia',
      lastName: 'Becker',
      position: 'HR Business Partner',
      department: 'Personal',
      email: 'becker@gesundheit-plus.de',
      phone: '+49112233445',
      mobile: '+49998877665',
      isMainContact: true,
      notes: 'Interessiert an langfristiger Zusammenarbeit',
      createdAt: '2023-11-20T13:45:00Z',
      updatedAt: '2024-01-10T10:30:00Z'
    }
  ]
};

// Beispiel-Requirements für Kunden
export const dummyRequirements = [
  {
    id: 'req1',
    customerId: 'cust1',
    title: 'Senior Frontend-Entwickler (React)',
    description: 'Wir suchen einen erfahrenen Frontend-Entwickler mit Expertise in React für die Weiterentwicklung unserer SaaS-Plattform.',
    department: 'Produktentwicklung',
    location: 'Berlin / Remote',
    skills: JSON.stringify(['React', 'TypeScript', 'NextJS', 'TailwindCSS']),
    experience: 5,
    education: 'Informatik oder ähnlicher Bereich',
    status: 'open',
    priority: 'high',
    startDate: '2024-04-01',
    isRemote: true,
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z'
  },
  {
    id: 'req2',
    customerId: 'cust1',
    title: 'DevOps Engineer',
    description: 'Für unser wachsendes Infrastrukturteam suchen wir einen DevOps Engineer mit umfassender Cloud-Erfahrung.',
    department: 'Infrastruktur',
    location: 'Berlin',
    skills: JSON.stringify(['Kubernetes', 'AWS', 'Terraform', 'Docker', 'CI/CD']),
    experience: 3,
    education: 'Informatik oder vergleichbare Ausbildung',
    status: 'open',
    priority: 'medium',
    startDate: '2024-05-01',
    isRemote: false,
    createdAt: '2024-02-20T14:30:00Z',
    updatedAt: '2024-02-20T14:30:00Z'
  },
  {
    id: 'req3',
    customerId: 'cust2',
    title: 'Elektroingenieur',
    description: 'Zur Verstärkung unseres Entwicklungsteams suchen wir einen erfahrenen Elektroingenieur für die Entwicklung neuer Produkte.',
    department: 'Produktentwicklung',
    location: 'Hamburg',
    skills: JSON.stringify(['Schaltungstechnik', 'PCB-Design', 'Embedded Systems', 'Altium Designer']),
    experience: 4,
    education: 'Ingenieurswissenschaften',
    status: 'open',
    priority: 'high',
    startDate: '2024-04-15',
    isRemote: false,
    createdAt: '2024-01-10T11:45:00Z',
    updatedAt: '2024-01-25T09:00:00Z'
  },
  {
    id: 'req4',
    customerId: 'cust5',
    title: 'IT-Systemadministrator im Gesundheitswesen',
    description: 'Für unsere IT-Abteilung suchen wir einen erfahrenen Systemadministrator mit Kenntnissen im Gesundheitswesen.',
    department: 'IT',
    location: 'Köln',
    skills: JSON.stringify(['Windows Server', 'Active Directory', 'Netzwerktechnik', 'Krankenhausinformationssysteme']),
    experience: 3,
    education: 'IT-Ausbildung oder Studium',
    status: 'open',
    priority: 'medium',
    startDate: '2024-06-01',
    isRemote: false,
    createdAt: '2024-02-28T10:20:00Z',
    updatedAt: '2024-02-28T10:20:00Z'
  }
];
