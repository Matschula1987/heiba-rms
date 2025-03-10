'use client'

import { useState } from 'react'
import { useMatchingStore } from '@/store/matchingStore'

interface MatchingConfigModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function MatchingConfigModal({ isOpen, onClose }: MatchingConfigModalProps) {
  const { matchingWeights, updateMatchingWeights } = useMatchingStore()
  const [weights, setWeights] = useState(matchingWeights)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMatchingWeights(weights)
    onClose()
  }

  const handleWeightChange = (key: keyof typeof weights, value: number) => {
    const currentTotal = Object.entries(weights)
      .reduce((sum, [k, v]) => k === key ? sum : sum + v, 0)
    
    if (currentTotal + value > 1) {
      const factor = (1 - value) / currentTotal
      const newWeights = { ...weights }
      Object.keys(newWeights).forEach(k => {
        if (k !== key) {
          newWeights[k as keyof typeof weights] *= factor
        }
      })
      newWeights[key] = value
      setWeights(newWeights)
    } else {
      setWeights({ ...weights, [key]: value })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-heiba-blue">Matching-Konfiguration</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="font-medium text-gray-700">Gewichtungen</h3>
            <p className="text-sm text-gray-500">
              Passen Sie die Gewichtung der verschiedenen Matching-Kriterien an.
              Die Summe aller Gewichtungen muss 100% ergeben.
            </p>
            
            <div className="space-y-4">
              {Object.entries(weights).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {key === 'skills' && 'Skills'}
                      {key === 'experience' && 'Berufserfahrung'}
                      {key === 'location' && 'Standort'}
                      {key === 'salary' && 'Gehalt'}
                      {key === 'education' && 'Ausbildung'}
                    </label>
                    <span className="text-sm text-gray-500">{Math.round(value * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={value}
                    onChange={(e) => handleWeightChange(key as keyof typeof weights, parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
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
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}