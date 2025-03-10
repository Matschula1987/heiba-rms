'use client'

import { useState } from 'react'

interface DateRangePickerProps {
  startDate: Date
  endDate: Date
  onChange: (startDate: Date, endDate: Date) => void
  presets?: {
    label: string
    getValue: () => { start: Date; end: Date }
  }[]
}

export default function DateRangePicker({ 
  startDate, 
  endDate, 
  onChange,
  presets = [
    {
      label: 'Letzte 7 Tage',
      getValue: () => ({
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: new Date()
      })
    },
    {
      label: 'Letzte 30 Tage',
      getValue: () => ({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      })
    },
    {
      label: 'Dieses Jahr',
      getValue: () => ({
        start: new Date(new Date().getFullYear(), 0, 1),
        end: new Date()
      })
    }
  ]
}: DateRangePickerProps) {
  const [showPresets, setShowPresets] = useState(false)

  const handlePresetClick = (preset: typeof presets[0]) => {
    const { start, end } = preset.getValue()
    onChange(start, end)
    setShowPresets(false)
  }

  return (
    <div className="relative">
      <div className="flex items-center space-x-4">
        <input
          type="date"
          value={startDate.toISOString().split('T')[0]}
          onChange={(e) => onChange(new Date(e.target.value), endDate)}
          className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
        />
        <span className="text-gray-500">bis</span>
        <input
          type="date"
          value={endDate.toISOString().split('T')[0]}
          onChange={(e) => onChange(startDate, new Date(e.target.value))}
          className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-heiba-blue/20"
        />
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="text-heiba-blue hover:text-heiba-gold transition-colors"
        >
          <i className="fas fa-calendar-alt"></i>
        </button>
      </div>

      {showPresets && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10">
          {presets.map((preset, index) => (
            <button
              key={index}
              onClick={() => handlePresetClick(preset)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}