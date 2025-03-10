"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Eye, FileEdit, Trash2, Users } from 'lucide-react'
import { Job } from '@/types'
import { useJobStore } from '@/store/jobStore'
import JobFormModal from '@/components/modals/JobFormModal'

interface JobListProps {
  jobs: Job[]
  onJobClick: (jobId: string) => void
}

export default function JobList({ jobs, onJobClick }: JobListProps) {
  const { deleteJob } = useJobStore()
  const [editJob, setEditJob] = useState<Job | undefined>(undefined)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const handleEdit = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditJob(job)
    setIsModalOpen(true)
  }

  const handleDelete = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Sind Sie sicher, dass Sie diese Stelle löschen möchten?')) {
      try {
        await deleteJob(jobId)
      } catch (error) {
        console.error('Fehler beim Löschen der Stelle:', error)
        alert('Beim Löschen ist ein Fehler aufgetreten.')
      }
    }
  }
  
  // Typisierter Status-Parameter
  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'archived':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  // Status-Text-Übersetzung
  const getStatusText = (status: Job['status']) => {
    switch (status) {
      case 'active':
        return 'Aktiv'
      case 'inactive':
        return 'Inaktiv'
      case 'draft':
        return 'Entwurf'
      case 'archived':
        return 'Archiviert'
      default:
        return status
    }
  }

  return (
    <>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stellentitel</TableHead>
              <TableHead>Unternehmen</TableHead>
              <TableHead>Standort</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bewerbungen</TableHead>
              <TableHead>Erstellt am</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow 
                key={job.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onJobClick(job.id)}
              >
                <TableCell className="font-medium">{job.title}</TableCell>
                <TableCell>{job.company_id ? `HeiBa GmbH (ID: ${job.company_id})` : 'HeiBa GmbH'}</TableCell>
                <TableCell>{job.location}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {getStatusText(job.status)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-gray-500" />
                      <span>{job.applications_count || 0}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {job.created_at 
                    ? new Date(job.created_at).toLocaleDateString('de-DE')
                    : '-'
                  }
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()} // Verhindert Auslösen des Row-Clicks
                      >
                        <span className="sr-only">Menü öffnen</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="cursor-pointer"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation()
                          onJobClick(job.id)
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Details</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer"
                        onClick={(e: React.MouseEvent) => handleEdit(job, e)}
                      >
                        <FileEdit className="mr-2 h-4 w-4" />
                        <span>Bearbeiten</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer text-red-600"
                        onClick={(e: React.MouseEvent) => handleDelete(job.id, e)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Löschen</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      
      {/* Modal zum Bearbeiten eines Jobs */}
      {editJob && (
        <JobFormModal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false)
            setEditJob(undefined)
          }}
          initialData={editJob}
        />
      )}
    </>
  )
}
