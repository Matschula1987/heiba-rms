import { ReportMetrics } from '@/store/reportStore'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export const exportService = {
  generateCSV: (metrics: ReportMetrics) => {
    const rows = [
      // Header
      ['Recruiting Performance Report', '', '', '', ''],
      ['Erstellt am:', new Date().toLocaleDateString('de-DE'), '', '', ''],
      ['', '', '', '', ''],
      
      // KPIs
      ['Kennzahlen', '', '', '', ''],
      ['Gesamtbewerbungen', metrics.totalApplications, '', '', ''],
      ['Aktive Stellen', metrics.activeJobs, '', '', ''],
      ['Durchschnittlicher Match Score', `${metrics.averageMatchScore}%`, '', '', ''],
      ['Time to Hire', `${metrics.timeToHire} Tage`, '', '', ''],
      ['', '', '', '', ''],
      
      // Status Distribution
      ['Bewerbungsstatus', 'Anzahl', '', '', ''],
      ['Neu', metrics.applicationsByStatus.new, '', '', ''],
      ['In Prüfung', metrics.applicationsByStatus.in_review, '', '', ''],
      ['Interview', metrics.applicationsByStatus.interview, '', '', ''],
      ['Angebot', metrics.applicationsByStatus.offer, '', '', ''],
      ['Abgelehnt', metrics.applicationsByStatus.rejected, '', '', ''],
      ['', '', '', '', ''],
      
      // Monthly Applications
      ['Bewerbungen pro Monat', '', '', '', ''],
      ...metrics.applicationsByMonth.map(data => [data.month, data.count, '', '', '']),
      ['', '', '', '', ''],
      
      // Job Performance
      ['Stellen Performance', '', '', '', ''],
      ['Stelle', 'Bewerbungen', 'Interviews', 'Angebote', 'Conversion'],
      ...metrics.jobPerformance.map(job => [
        job.jobTitle,
        job.applications,
        job.interviews,
        job.offers,
        `${((job.offers / job.applications) * 100).toFixed(1)}%`
      ]),
      ['', '', '', '', ''],
      
      // Location Distribution
      ['Standortverteilung', '', '', '', ''],
      ...metrics.locationDistribution.map(loc => [loc.location, loc.count, '', '', ''])
    ]

    return rows.map(row => row.join(';')).join('\\n')
  },

  downloadCSV: (metrics: ReportMetrics) => {
    const csv = exportService.generateCSV(metrics)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `recruiting-report-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },

  generatePDF: async (metrics: ReportMetrics) => {
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.width
    const margin = 20

    // Titel
    pdf.setFontSize(20)
    pdf.setTextColor(0, 36, 81) // HeiBa Blau
    pdf.text('Recruiting Performance Report', margin, margin)

    // Datum
    pdf.setFontSize(12)
    pdf.setTextColor(100)
    pdf.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, margin, margin + 10)

    // KPIs
    pdf.setFontSize(14)
    pdf.setTextColor(0, 36, 81)
    pdf.text('Kennzahlen', margin, margin + 25)

    const kpiData = [
      ['Gesamtbewerbungen', metrics.totalApplications.toString()],
      ['Aktive Stellen', metrics.activeJobs.toString()],
      ['Match Score', `${metrics.averageMatchScore}%`],
      ['Time to Hire', `${metrics.timeToHire} Tage`],
    ]

    // @ts-ignore (jspdf-autotable types)
    pdf.autoTable({
      startY: margin + 30,
      head: [['Kennzahl', 'Wert']],
      body: kpiData,
      theme: 'grid',
      headStyles: { fillColor: [0, 36, 81] },
      margin: { left: margin },
    })

    // Bewerbungsstatus
    pdf.setFontSize(14)
    pdf.setTextColor(0, 36, 81)
    pdf.text('Bewerbungsstatus', margin, pdf.lastAutoTable.finalY + 20)

    const statusData = [
      ['Neu', metrics.applicationsByStatus.new.toString()],
      ['In Prüfung', metrics.applicationsByStatus.in_review.toString()],
      ['Interview', metrics.applicationsByStatus.interview.toString()],
      ['Angebot', metrics.applicationsByStatus.offer.toString()],
      ['Abgelehnt', metrics.applicationsByStatus.rejected.toString()],
    ]

    // @ts-ignore
    pdf.autoTable({
      startY: pdf.lastAutoTable.finalY + 25,
      head: [['Status', 'Anzahl']],
      body: statusData,
      theme: 'grid',
      headStyles: { fillColor: [0, 36, 81] },
      margin: { left: margin },
    })

    // Stellen Performance
    pdf.addPage()
    pdf.setFontSize(14)
    pdf.setTextColor(0, 36, 81)
    pdf.text('Stellen Performance', margin, margin)

    const jobData = metrics.jobPerformance.map(job => [
      job.jobTitle,
      job.applications.toString(),
      job.interviews.toString(),
      job.offers.toString(),
      `${((job.offers / job.applications) * 100).toFixed(1)}%`,
    ])

    // @ts-ignore
    pdf.autoTable({
      startY: margin + 5,
      head: [['Stelle', 'Bewerbungen', 'Interviews', 'Angebote', 'Conversion']],
      body: jobData,
      theme: 'grid',
      headStyles: { fillColor: [0, 36, 81] },
      margin: { left: margin },
    })

    // Standortverteilung
    pdf.setFontSize(14)
    pdf.setTextColor(0, 36, 81)
    pdf.text('Standortverteilung', margin, pdf.lastAutoTable.finalY + 20)

    const locationData = metrics.locationDistribution.map(loc => [
      loc.location,
      loc.count.toString(),
    ])

    // @ts-ignore
    pdf.autoTable({
      startY: pdf.lastAutoTable.finalY + 25,
      head: [['Standort', 'Bewerbungen']],
      body: locationData,
      theme: 'grid',
      headStyles: { fillColor: [0, 36, 81] },
      margin: { left: margin },
    })

    // Footer
    const pageCount = pdf.internal.getNumberOfPages()
    pdf.setFontSize(10)
    pdf.setTextColor(100)
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      pdf.text(
        `Seite ${i} von ${pageCount}`,
        pageWidth - margin,
        pdf.internal.pageSize.height - 10,
        { align: 'right' }
      )
    }

    // PDF herunterladen
    pdf.save(`recruiting-report-${new Date().toISOString().split('T')[0]}.pdf`)
  }
}