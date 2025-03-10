// Simples Seed-Skript für Testdaten
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./heiba.db');

// Datenbankeinträge in einer Transaktion durchführen
db.serialize(() => {
  db.run('BEGIN TRANSACTION');

  try {
    // 1. Kunden einfügen
    console.log('Füge Testdaten in die Datenbank ein...');
    
    // Kunden einfügen
    const customers = [
      {
        id: 'cust1',
        name: 'TechSolutions GmbH',
        type: 'customer',
        status: 'active',
        industry: 'IT & Software',
        website: 'https://techsolutions-beispiel.de',
        address: JSON.stringify({
          street: 'Technikstraße 42',
          city: 'Berlin',
          postalCode: '10115',
          country: 'Deutschland'
        }),
        notes: 'Langjähriger Kunde mit Schwerpunkt in der Softwareentwicklung. Sucht regelmäßig nach Frontend- und Backend-Entwicklern.',
        created_at: '2023-01-15T10:00:00Z',
        updated_at: '2024-02-20T14:30:00Z'
      },
      {
        id: 'cust2',
        name: 'Mustermann AG',
        type: 'customer',
        status: 'active',
        industry: 'Fertigung',
        website: 'https://mustermann-ag.de',
        address: JSON.stringify({
          street: 'Industrieweg 10',
          city: 'Hamburg',
          postalCode: '20095',
          country: 'Deutschland'
        }),
        notes: 'Fertigungsunternehmen mit regelmäßigem Bedarf an technischen Fachkräften und Ingenieuren.',
        created_at: '2023-03-20T08:15:00Z',
        updated_at: '2024-01-10T11:45:00Z'
      },
      {
        id: 'cust3',
        name: 'Innovate Startup',
        type: 'prospect',
        status: 'prospect',
        industry: 'Technologie',
        website: 'https://innovate-startup.de',
        address: JSON.stringify({
          street: 'Startup Allee 5',
          city: 'München',
          postalCode: '80331',
          country: 'Deutschland'
        }),
        notes: 'Junges Unternehmen mit innovativem KI-Produkt. Hat Interesse an Entwicklern mit ML-Erfahrung geäußert.',
        created_at: '2024-01-05T14:20:00Z',
        updated_at: '2024-02-15T09:30:00Z'
      },
      {
        id: 'cust4',
        name: 'FinanzDirekt AG',
        type: 'customer',
        status: 'inactive',
        industry: 'Finanzen',
        website: 'https://finanzdirekt.de',
        address: JSON.stringify({
          street: 'Bankenplatz 7',
          city: 'Frankfurt',
          postalCode: '60311',
          country: 'Deutschland'
        }),
        notes: 'Finanzdienstleister, momentan keine aktiven Stellen. Letzter Kontakt vor 8 Monaten.',
        created_at: '2022-06-10T09:00:00Z',
        updated_at: '2023-08-22T16:15:00Z'
      },
      {
        id: 'cust5',
        name: 'Gesundheit Plus',
        type: 'prospect',
        status: 'prospect',
        industry: 'Gesundheitswesen',
        website: 'https://gesundheit-plus.de',
        address: JSON.stringify({
          street: 'Klinikstraße 23',
          city: 'Köln',
          postalCode: '50667',
          country: 'Deutschland'
        }),
        notes: 'Betreiber mehrerer Kliniken, interessiert an medizinischem Fachpersonal und IT-Spezialisten für Gesundheitssysteme.',
        created_at: '2023-11-20T13:45:00Z',
        updated_at: '2024-02-28T10:20:00Z'
      }
    ];

    customers.forEach(customer => {
      db.run(`
        INSERT INTO customers (
          id, name, type, status, industry, website, 
          address, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        customer.id,
        customer.name,
        customer.type,
        customer.status,
        customer.industry,
        customer.website,
        customer.address,
        customer.notes,
        customer.created_at,
        customer.updated_at
      ]);
    });

    // 2. Kontakte einfügen
    const contacts = [
      {
        id: 'cont1',
        customer_id: 'cust1',
        first_name: 'Max',
        last_name: 'Müller',
        position: 'HR Manager',
        department: 'Personal',
        email: 'max.mueller@techsolutions-beispiel.de',
        phone: '+49123456789',
        mobile: '+49987654321',
        is_main_contact: 1,
        notes: 'Hauptansprechpartner für Recruitingfragen',
        created_at: '2023-01-15T10:00:00Z',
        updated_at: '2023-06-20T14:30:00Z'
      },
      {
        id: 'cont2',
        customer_id: 'cust1',
        first_name: 'Laura',
        last_name: 'Schmidt',
        position: 'CTO',
        department: 'Technische Leitung',
        email: 'l.schmidt@techsolutions-beispiel.de',
        phone: '+49123456780',
        mobile: null,
        is_main_contact: 0,
        notes: 'Technische Ansprechpartnerin, nimmt an Interviews teil',
        created_at: '2023-02-10T09:15:00Z',
        updated_at: '2023-05-15T11:30:00Z'
      },
      {
        id: 'cont3',
        customer_id: 'cust2',
        first_name: 'Thomas',
        last_name: 'Weber',
        position: 'Personalleiter',
        department: 'HR',
        email: 'weber@mustermann-ag.de',
        phone: '+4955557777',
        mobile: '+49444433333',
        is_main_contact: 1,
        notes: 'Verantwortlich für alle Personalentscheidungen',
        created_at: '2023-03-20T08:15:00Z',
        updated_at: '2023-08-05T15:45:00Z'
      },
      {
        id: 'cont4',
        customer_id: 'cust3',
        first_name: 'Sarah',
        last_name: 'Fischer',
        position: 'Gründerin & CEO',
        department: 'Geschäftsführung',
        email: 'sarah@innovate-startup.de',
        phone: '+49111222333',
        mobile: '+49111222334',
        is_main_contact: 1,
        notes: 'Direkte Ansprechpartnerin, trifft alle Entscheidungen',
        created_at: '2024-01-05T14:20:00Z',
        updated_at: '2024-01-05T14:20:00Z'
      },
      {
        id: 'cont5',
        customer_id: 'cust4',
        first_name: 'Michael',
        last_name: 'Keller',
        position: 'Abteilungsleiter IT',
        department: 'IT',
        email: 'keller@finanzdirekt.de',
        phone: '+4966778899',
        mobile: null,
        is_main_contact: 1,
        notes: 'Zuständig für IT-Recruiting',
        created_at: '2022-06-10T09:00:00Z',
        updated_at: '2022-11-15T14:20:00Z'
      },
      {
        id: 'cont6',
        customer_id: 'cust5',
        first_name: 'Julia',
        last_name: 'Becker',
        position: 'HR Business Partner',
        department: 'Personal',
        email: 'becker@gesundheit-plus.de',
        phone: '+49112233445',
        mobile: '+49998877665',
        is_main_contact: 1,
        notes: 'Interessiert an langfristiger Zusammenarbeit',
        created_at: '2023-11-20T13:45:00Z',
        updated_at: '2024-01-10T10:30:00Z'
      }
    ];

    contacts.forEach(contact => {
      db.run(`
        INSERT INTO contacts (
          id, customer_id, first_name, last_name, position, 
          department, email, phone, mobile, is_main_contact, notes,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        contact.id,
        contact.customer_id,
        contact.first_name,
        contact.last_name,
        contact.position,
        contact.department,
        contact.email,
        contact.phone,
        contact.mobile,
        contact.is_main_contact,
        contact.notes,
        contact.created_at,
        contact.updated_at
      ]);
    });

    // 3. Anforderungen einfügen
    const requirements = [
      {
        id: 'req1',
        customer_id: 'cust1',
        title: 'Senior Frontend-Entwickler (React)',
        description: 'Wir suchen einen erfahrenen Frontend-Entwickler mit Expertise in React für die Weiterentwicklung unserer SaaS-Plattform.',
        department: 'Produktentwicklung',
        location: 'Berlin / Remote',
        skills: JSON.stringify(['React', 'TypeScript', 'NextJS', 'TailwindCSS']),
        experience: 5,
        education: 'Informatik oder ähnlicher Bereich',
        status: 'open',
        priority: 'high',
        start_date: '2024-04-01',
        is_remote: 1,
        created_at: '2024-02-15T10:00:00Z',
        updated_at: '2024-02-15T10:00:00Z'
      },
      {
        id: 'req2',
        customer_id: 'cust1',
        title: 'DevOps Engineer',
        description: 'Für unser wachsendes Infrastrukturteam suchen wir einen DevOps Engineer mit umfassender Cloud-Erfahrung.',
        department: 'Infrastruktur',
        location: 'Berlin',
        skills: JSON.stringify(['Kubernetes', 'AWS', 'Terraform', 'Docker', 'CI/CD']),
        experience: 3,
        education: 'Informatik oder vergleichbare Ausbildung',
        status: 'open',
        priority: 'medium',
        start_date: '2024-05-01',
        is_remote: 0,
        created_at: '2024-02-20T14:30:00Z',
        updated_at: '2024-02-20T14:30:00Z'
      },
      {
        id: 'req3',
        customer_id: 'cust2',
        title: 'Elektroingenieur',
        description: 'Zur Verstärkung unseres Entwicklungsteams suchen wir einen erfahrenen Elektroingenieur für die Entwicklung neuer Produkte.',
        department: 'Produktentwicklung',
        location: 'Hamburg',
        skills: JSON.stringify(['Schaltungstechnik', 'PCB-Design', 'Embedded Systems', 'Altium Designer']),
        experience: 4,
        education: 'Ingenieurswissenschaften',
        status: 'open',
        priority: 'high',
        start_date: '2024-04-15',
        is_remote: 0,
        created_at: '2024-01-10T11:45:00Z',
        updated_at: '2024-01-25T09:00:00Z'
      },
      {
        id: 'req4',
        customer_id: 'cust5',
        title: 'IT-Systemadministrator im Gesundheitswesen',
        description: 'Für unsere IT-Abteilung suchen wir einen erfahrenen Systemadministrator mit Kenntnissen im Gesundheitswesen.',
        department: 'IT',
        location: 'Köln',
        skills: JSON.stringify(['Windows Server', 'Active Directory', 'Netzwerktechnik', 'Krankenhausinformationssysteme']),
        experience: 3,
        education: 'IT-Ausbildung oder Studium',
        status: 'open',
        priority: 'medium',
        start_date: '2024-06-01',
        is_remote: 0,
        created_at: '2024-02-28T10:20:00Z',
        updated_at: '2024-02-28T10:20:00Z'
      }
    ];

    requirements.forEach(req => {
      db.run(`
        INSERT INTO requirements (
          id, customer_id, title, description, department, location,
          skills, experience, education, status, priority, start_date,
          is_remote, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        req.id,
        req.customer_id,
        req.title,
        req.description,
        req.department,
        req.location,
        req.skills,
        req.experience,
        req.education,
        req.status,
        req.priority,
        req.start_date,
        req.is_remote,
        req.created_at,
        req.updated_at
      ]);
    });

    // Transaktion abschließen
    db.run('COMMIT', function(err) {
      if (err) {
        console.error('Fehler beim Abschließen der Transaktion:', err);
      } else {
        console.log('Alle Testdaten erfolgreich in die Datenbank eingefügt.');
      }
      
      // Datenbankverbindung schließen
      db.close();
    });
  } catch (error) {
    // Bei Fehler: Transaktion zurückrollen
    console.error('Fehler beim Einfügen der Testdaten:', error);
    db.run('ROLLBACK');
    db.close();
  }
});
