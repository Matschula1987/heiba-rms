'use client'

import { useState } from 'react'
import { Candidate } from '@/types'

interface QualificationProfileProps {
  candidate: Candidate
}

export default function QualificationProfile({ candidate }: QualificationProfileProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-heiba-blue">Qualifikationsprofil</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-gray-400 hover:text-heiba-blue transition-colors"
        >
          <i className={`fas fa-${isEditing ? 'save' : 'edit'}`}></i>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Fähigkeiten */}
        <div>
          <h3 className="text-md font-medium mb-4">Fähigkeiten & Kompetenzen</h3>
          <div className="space-y-4">
            {candidate.qualificationProfile?.skills.map((skill, index) => (
              <div key={index} className="flex items-center justify-between">
                <span>{skill.name}</span>
                {isEditing ? (
                  <select
                    value={skill.level}
                    className="px-2 py-1 border rounded"
                  >
                    <option value="basic">Grundkenntnisse</option>
                    <option value="intermediate">Fortgeschritten</option>
                    <option value="advanced">Experte</option>
                  </select>
                ) : (
                  <span className={`px-2 py-1 rounded text-sm ${
                    skill.level === 'basic' ? 'bg-blue-100 text-blue-800' :
                    skill.level === 'intermediate' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {skill.level === 'basic' ? 'Grundkenntnisse' :
                     skill.level === 'intermediate' ? 'Fortgeschritten' :
                     'Experte'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Berufserfahrung */}
        <div>
          <h3 className="text-md font-medium mb-4">Berufserfahrung</h3>
          <div className="space-y-4">
            {candidate.qualificationProfile?.experience.map((exp, index) => (
              <div key={index} className="border-l-2 border-gray-200 pl-4 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{exp.position}</h4>
                    <p className="text-gray-600">{exp.company}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {exp.startDate} - {exp.endDate || 'aktuell'}
                  </span>
                </div>
                <p className="text-gray-600 mt-2">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ausbildung */}
        <div>
          <h3 className="text-md font-medium mb-4">Ausbildung</h3>
          <div className="space-y-4">
            {candidate.qualificationProfile?.education.map((edu, index) => (
              <div key={index} className="border-l-2 border-gray-200 pl-4 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{edu.degree}</h4>
                    <p className="text-gray-600">{edu.institution}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {edu.startDate} - {edu.endDate || 'aktuell'}
                  </span>
                </div>
                <p className="text-gray-600 mt-2">{edu.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sprachen */}
        <div>
          <h3 className="text-md font-medium mb-4">Sprachkenntnisse</h3>
          <div className="space-y-4">
            {candidate.qualificationProfile?.languages.map((lang, index) => (
              <div key={index} className="flex items-center justify-between">
                <span>{lang.language}</span>
                {isEditing ? (
                  <select
                    value={lang.level}
                    className="px-2 py-1 border rounded"
                  >
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                    <option value="native">Muttersprache</option>
                  </select>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {lang.level}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}