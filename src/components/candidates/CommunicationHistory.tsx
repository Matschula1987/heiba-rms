'use client'

import { useState } from 'react'
import { useCommunicationStore } from '@/store/communicationStore'

interface CommunicationHistoryProps {
  candidateId: string
}

export default function CommunicationHistory({ candidateId }: CommunicationHistoryProps) {
  const { communications, addCommunication } = useCommunicationStore()
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [newMessage, setNewMessage] = useState({
    type: 'email',
    subject: '',
    content: ''
  })

  const candidateCommunications = communications.filter(
    comm => comm.candidateId === candidateId
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await addCommunication({
      ...newMessage,
      candidateId,
      timestamp: new Date().toISOString()
    })
    setNewMessage({ type: 'email', subject: '', content: '' })
    setShowNewMessage(false)
  }

  return (
    <div className="space-y-4">
      {/* Neue Nachricht Button */}
      <button
        onClick={() => setShowNewMessage(true)}
        className="w-full px-4 py-2 text-sm text-heiba-blue border border-heiba-blue rounded-lg hover:bg-heiba-blue hover:text-white transition-colors"
      >
        <i className="fas fa-plus mr-2"></i>
        Neue Nachricht
      </button>

      {/* Neue Nachricht Form */}
      {showNewMessage && (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
          <div className="flex items-center space-x-4 mb-4">
            <select
              value={newMessage.type}
              onChange={(e) => setNewMessage({...newMessage, type: e.target.value})}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="email">E-Mail</option>
              <option value="phone">Telefonat</option>
              <option value="meeting">Meeting</option>
            </select>
            <button
              type="button"
              onClick={() => setShowNewMessage(false)}
              className="text-gray-400 hover:text-red-500"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <input
            type="text"
            placeholder="Betreff"
            value={newMessage.subject}
            onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />

          <textarea
            placeholder="Nachricht"
            value={newMessage.content}
            onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg h-32"
            required
          />

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowNewMessage(false)}
              className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-heiba-gold text-white rounded-lg hover:bg-[#C19B20]"
            >
              Senden
            </button>
          </div>
        </form>
      )}

      {/* Kommunikationsverlauf */}
      <div className="space-y-4">
        {candidateCommunications.map((comm) => (
          <div
            key={comm.id}
            className="p-4 border rounded-lg space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <i className={`fas fa-${
                  comm.type === 'email' ? 'envelope' :
                  comm.type === 'phone' ? 'phone' : 'calendar'
                } text-gray-400`}></i>
                <span className="font-medium">{comm.subject}</span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(comm.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-600 whitespace-pre-line">
              {comm.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}