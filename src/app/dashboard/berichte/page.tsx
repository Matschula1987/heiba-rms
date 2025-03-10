'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BerichteRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // Umleitung zur reports-Seite
    router.push('/dashboard/reports')
  }, [router])
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-heiba-blue">Weiterleitung...</div>
    </div>
  )
}
