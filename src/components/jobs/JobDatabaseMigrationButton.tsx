'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Loader2, Database, Check, AlertCircle } from 'lucide-react'

export default function JobDatabaseMigrationButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    alreadyMigrated?: boolean;
  } | null>(null)

  const runMigration = async () => {
    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/migrate-jobs')
      const data = await response.json()
      
      setResult({
        success: data.success,
        message: data.message,
        alreadyMigrated: data.alreadyMigrated
      })
    } catch (error) {
      setResult({
        success: false,
        message: 'Bei der Migration ist ein Fehler aufgetreten. Bitte den Administrator kontaktieren.'
      })
      console.error('Migration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-2">
      <Button 
        onClick={runMigration} 
        disabled={isLoading}
        className="flex items-center space-x-2 bg-[var(--primary-dark)] hover:bg-[var(--primary-light)] text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Migration läuft...</span>
          </>
        ) : (
          <>
            <Database className="h-4 w-4" />
            <span>Job-Datenbank erweitern</span>
          </>
        )}
      </Button>
      
      {result && (
        <div className={`text-sm px-3 py-2 rounded-md flex items-center space-x-2 
          ${result.success 
            ? result.alreadyMigrated 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
          }`}>
          {result.success ? (
            result.alreadyMigrated ? (
              <Database className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>{result.message}</span>
        </div>
      )}
    </div>
  )
}
