import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { QualificationProfile, Candidate, Skill } from '@/types';

// Extend jsPDF with autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface QualificationPDFOptions {
  showEducation?: boolean;
  showCertificates?: boolean;
  showLanguages?: boolean;
  showExperience?: boolean;
  showCompanyLogo?: boolean;
  showContactInfo?: boolean;
  customNotes?: string;
}

/**
 * Erzeugt ein PDF-Qualifikationsprofil für einen Kandidaten
 */
export const generateQualificationProfilePDF = (
  candidate: Candidate,
  profile: QualificationProfile,
  options: QualificationPDFOptions = {}
): jsPDF => {
  // Default options
  const defaultOptions: QualificationPDFOptions = {
    showEducation: true,
    showCertificates: true,
    showLanguages: true,
    showExperience: true,
    showCompanyLogo: true,
    showContactInfo: false,
    customNotes: '',
  };

  const mergedOptions = { ...defaultOptions, ...options };

  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Define constants for layout
  const PAGE_WIDTH = 210;
  const MARGIN = 15;
  const CONTENT_WIDTH = PAGE_WIDTH - (2 * MARGIN);

  // Define colors based on HeiBa branding
  const PRIMARY_COLOR = '#002451'; // HeiBa Blau
  const SECONDARY_COLOR = '#D4AF37'; // HeiBa Gold
  
  // Add header with logo
  if (mergedOptions.showCompanyLogo) {
    // This would be replaced with an actual logo
    // For demonstration, we'll draw a simple placeholder
    doc.setFillColor(PRIMARY_COLOR);
    doc.rect(MARGIN, MARGIN, 40, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text('HeiBa', MARGIN + 20, MARGIN + 6, { align: 'center' });
  }

  // Add document title and candidate name
  doc.setTextColor(PRIMARY_COLOR);
  doc.setFontSize(20);
  doc.text('Qualifikationsprofil', PAGE_WIDTH / 2, MARGIN + 20, { align: 'center' });
  
  doc.setFontSize(16);
  const fullName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim();
  doc.text(fullName, PAGE_WIDTH / 2, MARGIN + 30, { align: 'center' });
  
  // Add position if available
  if (candidate.position) {
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(candidate.position, PAGE_WIDTH / 2, MARGIN + 38, { align: 'center' });
  }

  let currentY = MARGIN + 45;

  // Add summary if available
  if (profile.summary) {
    currentY += 10;
    addSectionHeader(doc, 'Berufserfahrung', MARGIN, currentY);
    currentY += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const summaryText = profile.summary || '';
    const splitSummary = doc.splitTextToSize(summaryText, CONTENT_WIDTH);
    doc.text(splitSummary, MARGIN, currentY);
    currentY += splitSummary.length * 5 + 5;
  }

  // Add technical skills section
  if (profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0) {
    currentY += 5;
    addSectionHeader(doc, 'Technische Kenntnisse', MARGIN, currentY);
    currentY += 8;
    
    // Group skills by categories if possible
    const categories = groupSkillsByCategory(profile.skills);
    
    for (const [category, skills] of Object.entries(categories)) {
      if (category !== 'Other') {
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'bold');
        doc.text(category, MARGIN, currentY);
        doc.setFont(undefined, 'normal');
        currentY += 5;
      }

      doc.setFontSize(10);
      
      // Create a bullet list of skills
      for (const skill of skills) {
        const skillName = skill.name || '';
        const skillLevel = skill.level || 3;
        const skillDesc = skill.description || '';
        
        const skillText = skillDesc 
          ? `${skillName} (${getSkillLevelText(skillLevel)}): ${skillDesc}`
          : `${skillName} (${getSkillLevelText(skillLevel)})`;
          
        const splitSkill = doc.splitTextToSize(`• ${skillText}`, CONTENT_WIDTH - 5);
        doc.text(splitSkill, MARGIN + 5, currentY);
        currentY += splitSkill.length * 5;
      }
      
      currentY += 2;
    }
  }

  // Add experience section
  if (mergedOptions.showExperience && profile.experience && Array.isArray(profile.experience) && profile.experience.length > 0) {
    currentY += 5;
    addSectionHeader(doc, 'Tätigkeitsschwerpunkte', MARGIN, currentY);
    currentY += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    for (const exp of profile.experience) {
      if (typeof exp === 'string') {
        // Simple string experience
        const expText = exp || '';
        const splitExp = doc.splitTextToSize(`• ${expText}`, CONTENT_WIDTH - 5);
        doc.text(splitExp, MARGIN + 5, currentY);
        currentY += splitExp.length * 5;
      } else {
        // Detailed experience object
        doc.setFont(undefined, 'bold');
        let positionText = (exp.position || exp.title || '').toString();
        if (exp.company) positionText += ` bei ${exp.company}`;
        if (exp.period) positionText += ` (${exp.period})`;
        
        doc.text(positionText, MARGIN, currentY);
        doc.setFont(undefined, 'normal');
        currentY += 5;
        
        if (exp.description) {
          const descText = exp.description || '';
          const splitDesc = doc.splitTextToSize(descText, CONTENT_WIDTH - 5);
          doc.text(splitDesc, MARGIN + 5, currentY);
          currentY += splitDesc.length * 5;
        }
      }
      
      currentY += 3;
    }
  }

  // Check if we need to add a new page for the competency matrix
  if (currentY > 200) {
    doc.addPage();
    currentY = MARGIN;
  }

  // Add competency matrix
  if (profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0) {
    currentY += 5;
    addSectionHeader(doc, 'Kompetenzmatrix', MARGIN, currentY);
    currentY += 8;
    
    // Create a table for skills
    const skillData = profile.skills.map(skill => {
      const skillName = skill.name || '';
      const skillLevel = skill.level || 3;
      const stars = '★'.repeat(skillLevel) + '☆'.repeat(5 - skillLevel);
      return [skillName, '', stars];
    });
    
    doc.autoTable({
      startY: currentY,
      head: [['Kompetenzbereich', '', 'Level']],
      body: skillData,
      margin: { left: MARGIN, right: MARGIN },
      styles: { 
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [0, 36, 81], // PRIMARY_COLOR in RGB
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 60 },
        2: { cellWidth: 30, halign: 'center' },
      },
      didDrawPage: (data: any) => {
        currentY = data.cursor.y || currentY;
      }
    });
  }

  // Check if we need to add a new page for the remaining sections
  if (currentY > 200) {
    doc.addPage();
    currentY = MARGIN;
  }

  // Add language proficiency
  if (mergedOptions.showLanguages && profile.languages && Array.isArray(profile.languages) && profile.languages.length > 0) {
    currentY += 10;
    addSectionHeader(doc, 'Sprachkenntnisse', MARGIN, currentY);
    currentY += 8;
    
    const languageData = profile.languages.map(lang => {
      const langName = (lang.name || lang.language || '').toString();
      const langLevel = (lang.level || '').toString();
      return [langName, langLevel];
    });
    
    doc.autoTable({
      startY: currentY,
      body: languageData,
      margin: { left: MARGIN, right: MARGIN },
      styles: { 
        fontSize: 10,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 80 },
      },
      didDrawPage: (data: any) => {
        currentY = data.cursor.y || currentY;
      }
    });
  }

  // Add certificates and qualifications
  if (mergedOptions.showCertificates && profile.certificates && Array.isArray(profile.certificates) && profile.certificates.length > 0) {
    currentY += 10;
    addSectionHeader(doc, 'Zertifikate / Zusatzqualifikationen', MARGIN, currentY);
    currentY += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    for (const cert of profile.certificates) {
      const certText = cert || '';
      doc.text(`• ${certText}`, MARGIN + 5, currentY);
      currentY += 5;
    }
  }

  // Add education history
  if (mergedOptions.showEducation && profile.education && Array.isArray(profile.education) && profile.education.length > 0) {
    currentY += 10;
    addSectionHeader(doc, 'Ausbildung', MARGIN, currentY);
    currentY += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    for (const edu of profile.education) {
      doc.setFont(undefined, 'bold');
      let degreeText = edu.degree || '';
      if (edu.institution) degreeText += ` an ${edu.institution}`;
      
      // Add period if available
      let periodText = '';
      if (edu.startDate && edu.endDate) {
        periodText = `(${formatDate(edu.startDate.toString())} - ${formatDate(edu.endDate.toString())})`;
      } else if (edu.startDate) {
        periodText = `(seit ${formatDate(edu.startDate.toString())})`;
      }
      
      if (periodText) degreeText += ` ${periodText}`;
      
      doc.text(degreeText, MARGIN, currentY);
      doc.setFont(undefined, 'normal');
      currentY += 5;
      
      if (edu.description) {
        const descText = edu.description || '';
        const splitDesc = doc.splitTextToSize(descText, CONTENT_WIDTH - 5);
        doc.text(splitDesc, MARGIN + 5, currentY);
        currentY += splitDesc.length * 5;
      }
      
      currentY += 3;
    }
  }

  // Add custom notes if provided
  if (mergedOptions.customNotes) {
    currentY += 10;
    addSectionHeader(doc, 'Notizen', MARGIN, currentY);
    currentY += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const noteText = mergedOptions.customNotes || '';
    const splitNotes = doc.splitTextToSize(noteText, CONTENT_WIDTH);
    doc.text(splitNotes, MARGIN, currentY);
  }

  // Add page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Seite ${i} von ${totalPages}`, PAGE_WIDTH - MARGIN, 290, { align: 'right' });
    
    // Add footer with generation date
    const today = new Date();
    const dateStr = today.toLocaleDateString('de-DE');
    doc.text(`Erstellt am: ${dateStr}`, MARGIN, 290);
  }

  return doc;
};

/**
 * Helper function to add section headers in the PDF
 */
const addSectionHeader = (doc: jsPDF, text: string, x: number, y: number): void => {
  doc.setFillColor(0, 36, 81); // Primary color
  doc.rect(x, y, 190 - (2 * x), 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text(text, x + 3, y + 4);
  doc.setFont(undefined, 'normal');
};

/**
 * Helper function to group skills by category
 */
const groupSkillsByCategory = (skills: Skill[]): Record<string, Skill[]> => {
  const categories: Record<string, Skill[]> = {
    'Programmiersprachen': [],
    'Frameworks & Bibliotheken': [],
    'Datenbanken': [],
    'DevOps & Cloud': [],
    'Marketing & Design': [],
    'Management': [],
    'Other': []
  };
  
  const categoryPatterns = {
    'Programmiersprachen': /javascript|typescript|java|python|c\+\+|c#|go|ruby|php|swift|kotlin|rust|perl|scala|haskell|dart|r|matlab|shell|bash/i,
    'Frameworks & Bibliotheken': /react|angular|vue|next|express|django|flask|spring|laravel|symfony|rails|jquery|bootstrap|tailwind|flutter|ionic/i,
    'Datenbanken': /sql|mysql|postgresql|mongodb|dynamodb|cassandra|redis|neo4j|sqlite|oracle|mariadb|firebase|elasticsearch/i,
    'DevOps & Cloud': /aws|azure|gcp|docker|kubernetes|jenkins|gitlab|github|terraform|ansible|puppet|chef|nginx|apache|linux|git|ci\/cd/i,
    'Marketing & Design': /seo|social media|content|marketing|photoshop|illustrator|figma|sketch|adobe|ui|ux|design|branding|analytics/i,
    'Management': /project management|scrum|agile|kanban|leadership|teamleitung|product owner|jira|lean|team|management|organisation/i
  };
  
  for (const skill of skills) {
    if (!skill || !skill.name) continue;
    
    let categorized = false;
    
    for (const [category, pattern] of Object.entries(categoryPatterns)) {
      if (pattern.test(skill.name.toLowerCase())) {
        categories[category].push(skill);
        categorized = true;
        break;
      }
    }
    
    if (!categorized) {
      categories['Other'].push(skill);
    }
  }
  
  // Remove empty categories
  Object.keys(categories).forEach(key => {
    if (categories[key].length === 0) {
      delete categories[key];
    }
  });
  
  return categories;
};

/**
 * Helper function to convert skill level number to text
 */
const getSkillLevelText = (level: number): string => {
  switch(level) {
    case 1: return 'Grundkenntnisse';
    case 2: return 'Fortgeschritten';
    case 3: return 'Gute Kenntnisse';
    case 4: return 'Sehr gute Kenntnisse';
    case 5: return 'Experte';
    default: return 'Mittlere Kenntnisse';
  }
};

/**
 * Format date string for display
 */
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // Handle different date formats
  if (dateStr.length === 4) {
    // Year only
    return dateStr;
  }
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      // Try parsing YYYY-MM format
      if (/^\d{4}-\d{2}$/.test(dateStr)) {
        const [year, month] = dateStr.split('-');
        const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
      }
      return dateStr;
    }
    
    return new Intl.DateTimeFormat('de-DE', {
      year: 'numeric',
      month: 'short'
    }).format(date);
  } catch (e) {
    return dateStr;
  }
};

/**
 * Save the PDF document for a candidate
 */
export const saveQualificationProfilePDF = async (
  candidate: Candidate,
  profile: QualificationProfile,
  options: QualificationPDFOptions = {}
): Promise<string> => {
  const doc = generateQualificationProfilePDF(candidate, profile, options);
  
  // Generate filename
  const lastName = candidate.lastName || '';
  const firstName = candidate.firstName || '';
  const filename = `Qualifikationsprofil_${lastName}_${firstName}.pdf`;
  
  // In a real application, we would save this to a file storage
  // For this demo, we'll return a data URL that can be used for download
  return doc.output('dataurlstring');
};

/**
 * Create a Document object for the generated PDF
 */
export const createQualificationProfileDocument = (
  candidate: Candidate,
  pdfData: string
): { document: any, documentId: string } => {
  const documentId = `qual_${Date.now()}`;
  
  // Create a new document object
  const document = {
    id: documentId,
    name: `Qualifikationsprofil_${candidate.lastName || ''}_${candidate.firstName || ''}.pdf`,
    type: 'qualification_profile',
    url: pdfData,
    size: Math.floor(pdfData.length / 1.33), // Approximate size conversion from base64
    uploadedAt: new Date().toISOString()
  };
  
  return { document, documentId };
};
