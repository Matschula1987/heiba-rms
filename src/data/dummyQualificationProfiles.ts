import { QualificationProfile } from '@/types'

export const dummyQualificationProfiles: Record<string, QualificationProfile> = {
  // Basis-Qualifikationsprofil für alle Kandidaten ohne spezifisches Profil
  default: {
    id: "default-profile",
    summary: "Erfahrene Fachkraft mit umfangreicher Expertise in verschiedenen Bereichen der IT und Softwareentwicklung. Nachgewiesene Erfolge in der Umsetzung komplexer Projekte und der Zusammenarbeit in agilen Teams.",
    skills: [
      { name: "JavaScript", level: 4, description: "Fortgeschrittene Kenntnisse in JavaScript, inkl. ES6+ Features" },
      { name: "TypeScript", level: 4, description: "Tägliche Nutzung von TypeScript in produktiven Anwendungen" },
      { name: "React", level: 5, description: "Experte in React inkl. Hooks, Context API und State Management" },
      { name: "Node.js", level: 3, description: "Grundlegende Kenntnisse in Backend-Entwicklung mit Node.js" },
      { name: "SQL", level: 3, description: "Erfahrung mit relationalen Datenbanken" },
      { name: "Git", level: 4, description: "Fortgeschrittene Kenntnisse in Versionskontrolle" },
      { name: "Agile Methoden", level: 5, description: "Umfangreiche Erfahrung mit Scrum und Kanban" }
    ],
    experience: [
      {
        position: "Senior Frontend-Entwickler",
        company: "TechSolutions GmbH",
        description: "Entwicklung und Wartung von komplexen Single-Page-Applications mit React und TypeScript. Implementierung von Continuous Integration/Deployment-Prozessen.",
        period: "Jan 2019 - Heute",
        startDate: "2019-01-01",
        endDate: "2023-01-01"
      },
      {
        position: "Webentwickler",
        company: "DigitalWorks AG",
        description: "Entwicklung von responsiven Websites und Webapplikationen mit modernen Frontend-Technologien.",
        period: "März 2016 - Dez 2018",
        startDate: "2016-03-01",
        endDate: "2018-12-31"
      }
    ],
    education: [
      {
        degree: "M.Sc. Informatik",
        institution: "Technische Universität Berlin",
        startDate: "2014-10-01",
        endDate: "2016-09-30",
        description: "Schwerpunkt: Softwareentwicklung und künstliche Intelligenz"
      },
      {
        degree: "B.Sc. Medieninformatik",
        institution: "Hochschule für Technik und Wirtschaft Berlin",
        startDate: "2011-10-01",
        endDate: "2014-09-30",
        description: "Grundlagen der Informatik mit Fokus auf Medienanwendungen"
      }
    ],
    certificates: [
      "Certified Scrum Master (CSM)",
      "AWS Certified Developer - Associate",
      "Microsoft Certified: Azure Developer Associate"
    ],
    languages: [
      { name: "Deutsch", level: "Muttersprache" },
      { name: "Englisch", level: "Fließend (C1)" },
      { name: "Französisch", level: "Grundkenntnisse (A2)" }
    ],
    candidateId: "default"
  },
  
  // Spezifisches Profil für einen Backend-Entwickler
  "backend-dev": {
    id: "backend-profile",
    summary: "Backend-Entwickler mit Schwerpunkt auf skalierbaren Microservices und Cloud-Architekturen. Experte für Datenbanksysteme und Server-seitige Anwendungen mit hohen Performance-Anforderungen.",
    skills: [
      { name: "Java", level: 5, description: "Umfassende Erfahrung in der Entwicklung von Enterprise-Anwendungen" },
      { name: "Spring Boot", level: 5, description: "Experte für Spring-basierte Microservices" },
      { name: "Docker", level: 4, description: "Container-basierte Deployment-Strategien" },
      { name: "Kubernetes", level: 3, description: "Orchestrierung von Microservices" },
      { name: "PostgreSQL", level: 4, description: "Tiefe Kenntnisse relationaler Datenbanken" },
      { name: "MongoDB", level: 3, description: "NoSQL-Datenbank für dokumentenorientierte Speicherung" },
      { name: "CI/CD", level: 4, description: "Jenkins, GitHub Actions, automatisierte Tests" }
    ],
    experience: [
      {
        position: "Senior Backend-Entwickler",
        company: "FinTech Solutions GmbH",
        description: "Entwicklung skalierbarer Microservices für eine Finanz-Plattform. Implementierung von hochverfügbaren Systemen mit Spring Boot und Kubernetes.",
        period: "Apr 2018 - Heute",
        startDate: "2018-04-01",
        endDate: "2023-01-01"
      },
      {
        position: "Java-Entwickler",
        company: "Enterprise Systems AG",
        description: "Entwicklung und Wartung von Java-EE-Anwendungen für Unternehmenskunden im Banken- und Versicherungssektor.",
        period: "Juli 2015 - März 2018",
        startDate: "2015-07-01",
        endDate: "2018-03-31"
      }
    ],
    education: [
      {
        degree: "M.Sc. Computer Science",
        institution: "Universität Hamburg",
        startDate: "2013-10-01",
        endDate: "2015-06-30",
        description: "Schwerpunkt: Verteilte Systeme und Datenbanken"
      }
    ],
    certificates: [
      "Oracle Certified Professional, Java SE 11 Developer",
      "Certified Kubernetes Administrator (CKA)",
      "AWS Certified Solutions Architect - Associate"
    ],
    languages: [
      { name: "Deutsch", level: "Muttersprache" },
      { name: "Englisch", level: "Verhandlungssicher (C2)" }
    ],
    candidateId: "backend-dev"
  },
  
  // Spezielles Profil für einen DevOps-Spezialisten
  "devops-specialist": {
    id: "devops-profile",
    summary: "DevOps-Ingenieur mit umfassender Erfahrung in der Automatisierung von Entwicklungs- und Deployment-Prozessen. Expertise in Cloud-Infrastrukturen und Container-Technologien.",
    skills: [
      { name: "AWS", level: 5, description: "Umfassende Erfahrung mit EC2, S3, Lambda, CloudFormation, etc." },
      { name: "Terraform", level: 4, description: "Infrastructure as Code für Multi-Cloud-Umgebungen" },
      { name: "Docker", level: 5, description: "Container-Erstellung, Optimierung und Orchestrierung" },
      { name: "Kubernetes", level: 5, description: "Cluster-Verwaltung, Skalierung, Monitoring" },
      { name: "CI/CD", level: 5, description: "Jenkins, GitLab CI, GitHub Actions, ArgoCD" },
      { name: "Python", level: 4, description: "Automatisierungsskripte und Tooling" },
      { name: "Linux", level: 5, description: "Shell-Scripting, Systemadministration" }
    ],
    experience: [
      {
        position: "Lead DevOps Engineer",
        company: "Cloud Technologies GmbH",
        description: "Leitung des DevOps-Teams und Implementierung einer vollständig automatisierten CI/CD-Pipeline. Migration der Infrastruktur zu Kubernetes und AWS.",
        period: "Jan 2020 - Heute",
        startDate: "2020-01-01",
        endDate: "2023-01-01"
      },
      {
        position: "Systems Engineer",
        company: "InfraServ AG",
        description: "Verwaltung von On-Premise-Infrastrukturen und Einführung von Containerisierung und Automatisierung.",
        period: "Feb 2017 - Dez 2019",
        startDate: "2017-02-01",
        endDate: "2019-12-31"
      }
    ],
    education: [
      {
        degree: "B.Sc. Informatik",
        institution: "RWTH Aachen",
        startDate: "2013-10-01",
        endDate: "2017-01-31",
        description: "Schwerpunkt: Systemprogrammierung und verteilte Systeme"
      }
    ],
    certificates: [
      "AWS Certified DevOps Engineer - Professional",
      "Certified Kubernetes Administrator (CKA)",
      "Linux Professional Institute Certification (LPIC-2)"
    ],
    languages: [
      { name: "Deutsch", level: "Muttersprache" },
      { name: "Englisch", level: "Fließend (C1)" }
    ],
    candidateId: "devops-specialist"
  }
};
