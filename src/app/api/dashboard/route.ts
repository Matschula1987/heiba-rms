import { NextResponse } from 'next/server'

// Simulierte Datenbank-Daten
const dashboardData = {
  stats: {
    openApplications: 24,
    dailyFits: 12,
    activeJobs: 18,
    portalEntries: 32,
    matchRate: 80,
  }
}

export async function GET() {
  try {
    return NextResponse.json(dashboardData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}