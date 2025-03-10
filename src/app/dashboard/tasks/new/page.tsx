'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarIcon, Clock, AlertTriangle } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTaskStore } from '@/store/taskStore';
import { TaskCreateInput, TaskType, TaskPriority } from '@/types/tasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GoldButton } from '@/components/ui/gold-button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

export default function NewTaskPage() {
  const router = useRouter();
  const { createTask } = useTaskStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date>(addDays(new Date(), 1));
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [taskType, setTaskType] = useState<TaskType>('manual');
  
  // Form validation
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    dueDate?: string;
  }>({});
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setError(null);
    const errors: {
      title?: string;
      dueDate?: string;
    } = {};
    
    // Validate inputs
    if (!title.trim()) {
      errors.title = 'Titel ist erforderlich';
    }
    
    if (!dueDate) {
      errors.dueDate = 'Fälligkeitsdatum ist erforderlich';
    }
    
    // If there are validation errors, show them and don't submit
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    // Reset validation errors
    setValidationErrors({});
    
    try {
      setIsSubmitting(true);
      
      // Prepare task data
      const taskData: TaskCreateInput = {
        title,
        description,
        due_date: dueDate.toISOString(),
        priority,
        task_type: taskType,
        is_automated: false
      };
      
      // Create task
      await createTask(taskData);
      
      // Redirect to tasks list
      router.push('/dashboard/tasks');
    } catch (error) {
      console.error('Fehler beim Erstellen der Aufgabe:', error);
      setError('Fehler beim Erstellen der Aufgabe. Bitte versuche es später erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get priority badge color
  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get task type label
  const getTaskTypeLabel = (type: TaskType) => {
    switch (type) {
      case 'application_followup':
        return 'Bewerbungs-Followup';
      case 'job_expiry':
        return 'Stellenanzeigen-Ablauf';
      case 'candidate_interview':
        return 'Kandidaten-Interview';
      case 'matching_review':
        return 'Matching-Überprüfung';
      case 'document_approval':
        return 'Dokument-Freigabe';
      case 'manual':
        return 'Manuell';
      default:
        return type;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--primary-dark)]">Neue Aufgabe erstellen</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-none mb-4 flex items-start">
          <AlertTriangle className="mr-2 mt-0.5" size={16} />
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-white rounded-none shadow-md overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Titel */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Titel <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Aufgabentitel eingeben"
              className={`w-full ${validationErrors.title ? 'border-red-500' : ''}`}
            />
            {validationErrors.title && (
              <p className="text-red-500 text-xs">{validationErrors.title}</p>
            )}
          </div>
          
          {/* Beschreibung */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Beschreibung
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschreibung der Aufgabe (optional)"
              className="w-full min-h-[100px]"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fälligkeitsdatum */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Fälligkeitsdatum <span className="text-red-500">*</span>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left ${
                      validationErrors.dueDate ? 'border-red-500' : ''
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? (
                      format(dueDate, 'PPP', { locale: de })
                    ) : (
                      <span>Datum auswählen</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => date && setDueDate(date)}
                    initialFocus
                    locale={de}
                  />
                </PopoverContent>
              </Popover>
              {validationErrors.dueDate && (
                <p className="text-red-500 text-xs">{validationErrors.dueDate}</p>
              )}
            </div>
            
            {/* Priorität */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Priorität
              </label>
              <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Priorität auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high" className="flex items-center">
                    <Badge className={`rounded-none font-medium mr-2 ${getPriorityColor('high')}`}>
                      Hoch
                    </Badge>
                    <span>Hohe Priorität</span>
                  </SelectItem>
                  <SelectItem value="medium" className="flex items-center">
                    <Badge className={`rounded-none font-medium mr-2 ${getPriorityColor('medium')}`}>
                      Mittel
                    </Badge>
                    <span>Mittlere Priorität</span>
                  </SelectItem>
                  <SelectItem value="low" className="flex items-center">
                    <Badge className={`rounded-none font-medium mr-2 ${getPriorityColor('low')}`}>
                      Niedrig
                    </Badge>
                    <span>Niedrige Priorität</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Aufgabentyp */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Aufgabentyp
              </label>
              <Select value={taskType} onValueChange={(value) => setTaskType(value as TaskType)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Typ auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manuell</SelectItem>
                  <SelectItem value="application_followup">Bewerbungs-Followup</SelectItem>
                  <SelectItem value="job_expiry">Stellenanzeigen-Ablauf</SelectItem>
                  <SelectItem value="candidate_interview">Kandidaten-Interview</SelectItem>
                  <SelectItem value="matching_review">Matching-Überprüfung</SelectItem>
                  <SelectItem value="document_approval">Dokument-Freigabe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Submit-Buttons */}
          <div className="flex justify-end space-x-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/tasks')}
            >
              Abbrechen
            </Button>
            <GoldButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Wird erstellt...' : 'Aufgabe erstellen'}
            </GoldButton>
          </div>
        </form>
      </div>
    </div>
  );
}
