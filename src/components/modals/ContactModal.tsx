'use client'

import { useState } from 'react'
import { Job } from '@/store/jobStore'
import { Candidate } from '@/store/candidateStore'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  job: Job
  candidate: Candidate
  matchScore: number
}

export default function ContactModal({ isOpen, onClose, job, candidate, matchScore }: ContactModalProps) {
  const [contactMethod, setContactMethod] = useState<'email' | 'phone' | 'portal'>('email')
  const [message, setMessage] = useState(`
Sehr geehrte(r) ${candidate.firstName} ${candidate.lastName},

wir haben festgestellt, dass Ihr Profil sehr gut zu unserer Position als "${job.title}" passt (Match-Score: ${matchScore}%).

Gerne möchten wir Sie zu einem persönlichen Gespräch einladen, um die Position und Ihre Qualifikationen im Detail zu besprechen.

Bitte lassen Sie uns wissen, wann es Ihnen am besten passt.

Mit freundlichen Grüßen`)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implementiere die tatsächliche Kontaktaufnahme
    try {
      // Hier würde die API-Anfrage erfolgen
      console.log('Kontaktaufnahme:', { contactMethod, message, job, candidate })
      onClose()
    } catch (error) {
      console.error('Fehler bei der Kontaktaufnahme:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-heiba-blue">Kontakt aufnehmen</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Kontaktmethode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kontaktmethode
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setContactMethod('email')}
                className={`px-4 py-2 rounded-lg border ${
                  contactMethod === 'email'
                    ? 'border-heiba-blue bg-heiba-blue/5 text-heiba-blue'
                    : 'border-gray-200 hover:border-heiba-blue/50'
                }`}
              >
                <i className="fas fa-envelope mr-2"></i>
                E-Mail
              </button>
              <button
                type="button"
                onClick={() => setContactMethod('phone')}
                className={`px-4 py-2 rounded-lg border ${
                  contactMethod === 'phone'
                    ? 'border-heiba-blue bg-heiba-blue/5 text-heiba-blue'
                    : 'border-gray-200 hover:border-heiba-blue/50'
                }`}
              >
                <i className="fas fa-phone mr-2"></i>
                Telefon
              </button>
              <button
                type="button"
                onClick={() => setContactMethod('portal')}
                className={`px-4 py-2 rounded-lg border ${
                  contactMethod === 'portal'
                    ? 'border-heiba-blue bg-heiba-blue/5 text-heiba-blue'
                    : 'border-gray-200 hover:border-heiba-blue/50'
                }`}
              >
                <i className="fas fa-globe mr-2"></i>
                Portal
              </button>
            </div>
          </div>

          {/* Kontaktdetails */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kontaktdetails
            </label>
            <div className="bg-gray-50 rounded-lg p-4">
              {contactMethod === 'email' && (
                <p className="text-gray-600">
                  <i className="fas fa-envelope mr-2"></i>
                  {candidate.email}
                </p>
              )}
              {contactMethod === 'phone' && (
                <p className="text-gray-600">
                  <i className="fas fa-phone mr-2"></i>
                  {candidate.phone}
                </p>
              )}
              {contactMethod === 'portal' && (
                <p className="text-gray-600">
                  <i className="fas fa-globe mr-2"></i>
                  Kontakt über Portal: {candidate.portalSource}
                </p>
              )}
            </div>
          </div>

          {/* Nachricht */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nachricht
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
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
              <i className="fas fa-paper-plane mr-2"></i>
              Kontakt aufnehmen
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}