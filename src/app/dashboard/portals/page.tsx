'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePortalStore, type Portal } from '@/store/portalStore'
import PortalFormModal from '@/components/modals/PortalFormModal'

export default function PortalsPage() {
  const { portals, fetchPortals, syncPortal, isLoading } = usePortalStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPortal, setSelectedPortal] = useState<Portal | null>(null)

  useEffect(() => {
    fetchPortals()
  }, [fetchPortals])

  const filteredPortals = portals.filter(portal => {
    const matchesSearch = portal.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || portal.type === filterType
    return matchesSearch && matchesType
  })

  const handleSync = async (portalId: string) => {
    try {
      await syncPortal(portalId)
    } catch (error) {
      console.error('Failed to sync portal:', error)
    }
  }

  const handleCloseModal = () => {
    setSelectedPortal(null)
    setIsModalOpen(false)
  }

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-heiba-blue">Loading...</div>
    </div>
  }

  // Rest des Codes bleibt gleich...
}