'use client'

import { useState } from 'react'
import { useCandidateStore } from '@/store/candidateStore'

interface NewCandidateFormProps {
  onClose: () => void
}

export default function NewCandidateForm({ onClose }: NewCandidateFormProps) {
  const { addCandidate } = useCandidateStore()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mobile: '',
    dateOfBirth: '',
    position: '',
    location: '',
    address: {
      street: '',
      houseNumber: '',
      postalCode: '',
      city: '',
      country: 'Deutschland'
    },
    skills: [] as string[],
    experience: 0,
    education: '',
    salaryExpectation: 0,
    newSkill: '' // Temporäres Feld für Skill-Eingabe
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { newSkill, ...candidateData } = formData
    await addCandidate({
      ...candidateData,
      source: 'manual'
    })
    onClose()
  }

  const addSkill = () => {
    if (formData.newSkill.trim()) {
      setFormData({
        ...formData,
        skills: [...formData.skills, formData.newSkill.trim()],
        newSkill: ''
      })
    }
  }

  const removeSkill = (index: number) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Persönliche Informationen */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-heiba-blue">Persönliche Informationen</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Vorname</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nachname</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">E-Mail</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mobil</label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={e => setFormData({...formData, mobile: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Geburtsdatum</label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        {/* Berufliche Informationen */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-heiba-blue">Berufliche Informationen</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Position</label>
            <input
              type="text"
              required
              value={formData.position}
              onChange={e => setFormData({...formData, position: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Standort</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Skills</label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={formData.newSkill}
                onChange={e => setFormData({...formData, newSkill: e.target.value})}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="block flex-1 rounded-md border border-gray-300 px-3 py-2"
                placeholder="Neue Skill eingeben"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-heiba-blue text-white rounded-md hover:bg-blue-600"
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="ml-2 text-gray-400 hover:text-red-500"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Berufserfahrung (Jahre)</label>
            <input
              type="number"
              min="0"
              value={formData.experience}
              onChange={e => setFormData({...formData, experience: Number(e.target.value)})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Ausbildung</label>
            <input
              type="text"
              value={formData.education}
              onChange={e => setFormData({...formData, education: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Gehaltsvorstellung (€/Jahr)</label>
            <input
              type="number"
              min="0"
              step="1000"
              value={formData.salaryExpectation}
              onChange={e => setFormData({...formData, salaryExpectation: Number(e.target.value)})}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Adresse */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-heiba-blue">Adresse</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Straße</label>
            <input
              type="text"
              value={formData.address.street}
              onChange={e => setFormData({
                ...formData,
                address: {...formData.address, street: e.target.value}
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Hausnummer</label>
            <input
              type="text"
              value={formData.address.houseNumber}
              onChange={e => setFormData({
                ...formData,
                address: {...formData.address, houseNumber: e.target.value}
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">PLZ</label>
            <input
              type="text"
              value={formData.address.postalCode}
              onChange={e => setFormData({
                ...formData,
                address: {...formData.address, postalCode: e.target.value}
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Stadt</label>
            <input
              type="text"
              value={formData.address.city}
              onChange={e => setFormData({
                ...formData,
                address: {...formData.address, city: e.target.value}
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-heiba-gold text-white rounded-md hover:bg-[#C19B20]"
        >
          Kandidat anlegen
        </button>
      </div>
    </form>
  )
}