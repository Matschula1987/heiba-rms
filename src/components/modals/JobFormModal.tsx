'use client'

import { useState } from 'react'
import { useJobStore } from '@/store/jobStore'
import { Job, JobStatus } from '@/types'

interface JobFormModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: Partial<Job>
}

export default function JobFormModal({ isOpen, onClose, initialData }: JobFormModalProps) {
  const { createJob, updateJob } = useJobStore()
  const [formData, setFormData] = useState<Partial<Job>>(initialData || {
    id: `job${Math.floor(Math.random() * 1000)}`,
    company_id: 1,
    title: '',
    description: '',
    location: '',
    salary_range: '',
    job_type: 'Vollzeit',
    requirements: '',
    department: '',
    status: 'draft' as JobStatus,
    skills: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (initialData && initialData.id) {
        // Update existing job
        await updateJob(initialData.id.toString(), formData)
      } else {
        // Create new job
        await createJob(formData)
      }
      onClose()
    } catch (error) {
      console.error('Failed to save job:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-heiba-blue">
            {initialData ? 'Stelle bearbeiten' : 'Neue Stelle erstellen'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titel
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Beschreibung
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Standort
            </label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gehaltsspanne
            </label>
            <input
              type="text"
              value={formData.salary_range || ''}
              onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
              placeholder="z.B. 50000-65000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arbeitsform
            </label>
            <select
              value={formData.job_type || 'Vollzeit'}
              onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
            >
              <option value="Vollzeit">Vollzeit</option>
              <option value="Teilzeit">Teilzeit</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Freelance">Freelance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anforderungen
            </label>
            <textarea
              value={formData.requirements || ''}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Abteilung
            </label>
            <input
              type="text"
              value={formData.department || ''}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status || 'draft'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as JobStatus })}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
            >
              <option value="draft">Entwurf</option>
              <option value="active">Aktiv</option>
              <option value="inactive">Inaktiv</option>
              <option value="archived">Archiviert</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="bg-heiba-gold text-white px-5 py-2 rounded-lg hover:bg-[#C19B20] transition-colors shadow-md"
            >
              {initialData ? 'Speichern' : 'Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
