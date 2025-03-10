'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, CheckSquare, Clock, Filter, Plus, Search, X } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTaskStore } from '@/store/taskStore';
import { TaskStatus, TaskPriority } from '@/types/tasks';
import { Button } from '@/components/ui/button';
import { GoldButton } from '@/components/ui/gold-button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export default function TasksPage() {
  const router = useRouter();
  const { 
    filteredTasks, 
    isLoading, 
    error, 
    fetchTasks, 
    markAsCompleted,
    statusFilter, 
    setStatusFilter,
    priorityFilter, 
    setPriorityFilter,
    searchTerm, 
    setSearchTerm,
    resetFilters
  } = useTaskStore();
  
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistance(date, new Date(), { addSuffix: true, locale: de });
  };
  
  // Get priority badge color
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
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
  
  // Get status badge color
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'open':
        return 'Offen';
      case 'in_progress':
        return 'In Bearbeitung';
      case 'completed':
        return 'Abgeschlossen';
      case 'cancelled':
        return 'Abgebrochen';
      default:
        return status;
    }
  };
  
  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return 'Hoch';
      case 'medium':
        return 'Mittel';
      case 'low':
        return 'Niedrig';
      default:
        return priority;
    }
  };

  // Handle task completion toggle
  const handleTaskCompletion = async (id: string, status: TaskStatus) => {
    if (status !== 'completed') {
      await markAsCompleted(id);
    }
  };
  
  // Handle task click
  const handleTaskClick = (id: string) => {
    router.push(`/dashboard/tasks/${id}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-dark)]"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-none mb-4">
        <p>Fehler beim Laden der Aufgaben: {error}</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--primary-dark)]">Aufgaben</h1>
        <div className="mt-4 sm:mt-0">
          <GoldButton onClick={() => router.push('/dashboard/tasks/new')}>
            <Plus size={16} className="mr-2" />
            Neue Aufgabe
          </GoldButton>
        </div>
      </div>
      
      {/* Suche und Filter */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Aufgaben durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-2 w-full"
            />
            {searchTerm && (
              <X
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                size={18}
                onClick={() => setSearchTerm('')}
              />
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <Filter size={18} className="mr-2" />
            {showFilters ? 'Filter ausblenden' : 'Filter anzeigen'}
          </Button>
        </div>
        
        {showFilters && (
          <div className="bg-white p-4 border rounded-none mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as TaskStatus | 'all')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="open">Offen</SelectItem>
                  <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                  <SelectItem value="completed">Abgeschlossen</SelectItem>
                  <SelectItem value="cancelled">Abgebrochen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priorität</label>
              <Select
                value={priorityFilter}
                onValueChange={(value) => setPriorityFilter(value as TaskPriority | 'all')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Priorität Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Prioritäten</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="low">Niedrig</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-1 flex items-end">
              <Button onClick={resetFilters} variant="outline" className="w-full">
                Filter zurücksetzen
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Tabs für verschiedene Ansichten */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Alle Aufgaben</TabsTrigger>
          <TabsTrigger value="today">Heute fällig</TabsTrigger>
          <TabsTrigger value="upcoming">Anstehend</TabsTrigger>
          <TabsTrigger value="completed">Abgeschlossen</TabsTrigger>
        </TabsList>
        
        {/* Alle Aufgaben Tab */}
        <TabsContent value="all">
          <div className="bg-white rounded-none shadow-md overflow-hidden">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <CheckSquare size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Keine Aufgaben gefunden</p>
                <p className="mt-1">Erstelle eine neue Aufgabe oder ändere deine Filtereinstellungen.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <li
                    key={task.id}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleTaskClick(task.id)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-1">
                        <input
                          type="checkbox"
                          checked={task.status === 'completed'}
                          onChange={() => handleTaskCompletion(task.id, task.status)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-5 w-5 text-[var(--accent)] rounded-none border-gray-300 focus:ring-[var(--accent)]"
                        />
                      </div>
                      <div className="ml-3 flex-grow">
                        <p className={`text-[var(--primary-dark)] font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge className={`rounded-none font-medium ${getStatusColor(task.status)}`}>
                            {getStatusLabel(task.status)}
                          </Badge>
                          <Badge className={`rounded-none font-medium ${getPriorityColor(task.priority)}`}>
                            {getPriorityLabel(task.priority)}
                          </Badge>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock size={14} className="mr-1" />
                            <span>Fällig {formatDate(task.due_date)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>
        
        {/* Heute fällig Tab */}
        <TabsContent value="today">
          <div className="bg-white rounded-none shadow-md overflow-hidden">
            {filteredTasks.filter(task => {
              const dueDate = new Date(task.due_date);
              const today = new Date();
              return dueDate.toDateString() === today.toDateString() && task.status !== 'completed';
            }).length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Keine Aufgaben für heute</p>
                <p className="mt-1">Es sind keine Aufgaben für heute fällig.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredTasks
                  .filter(task => {
                    const dueDate = new Date(task.due_date);
                    const today = new Date();
                    return dueDate.toDateString() === today.toDateString() && task.status !== 'completed';
                  })
                  .map((task) => (
                    <li
                      key={task.id}
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleTaskClick(task.id)}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-1">
                          <input
                            type="checkbox"
                            checked={task.status === 'completed'}
                            onChange={() => handleTaskCompletion(task.id, task.status)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-5 w-5 text-[var(--accent)] rounded-none border-gray-300 focus:ring-[var(--accent)]"
                          />
                        </div>
                        <div className="ml-3 flex-grow">
                          <p className="text-[var(--primary-dark)] font-medium">
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge className={`rounded-none font-medium ${getPriorityColor(task.priority)}`}>
                              {getPriorityLabel(task.priority)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </TabsContent>
        
        {/* Anstehend Tab */}
        <TabsContent value="upcoming">
          <div className="bg-white rounded-none shadow-md overflow-hidden">
            {filteredTasks.filter(task => {
              const dueDate = new Date(task.due_date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return dueDate > today && task.status !== 'completed';
            }).length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Keine anstehenden Aufgaben</p>
                <p className="mt-1">Du hast keine anstehenden Aufgaben für die nächsten Tage.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredTasks
                  .filter(task => {
                    const dueDate = new Date(task.due_date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return dueDate > today && task.status !== 'completed';
                  })
                  .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                  .map((task) => (
                    <li
                      key={task.id}
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleTaskClick(task.id)}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-1">
                          <input
                            type="checkbox"
                            checked={task.status === 'completed'}
                            onChange={() => handleTaskCompletion(task.id, task.status)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-5 w-5 text-[var(--accent)] rounded-none border-gray-300 focus:ring-[var(--accent)]"
                          />
                        </div>
                        <div className="ml-3 flex-grow">
                          <p className="text-[var(--primary-dark)] font-medium">
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge className={`rounded-none font-medium ${getPriorityColor(task.priority)}`}>
                              {getPriorityLabel(task.priority)}
                            </Badge>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock size={14} className="mr-1" />
                              <span>Fällig {formatDate(task.due_date)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </TabsContent>
        
        {/* Abgeschlossen Tab */}
        <TabsContent value="completed">
          <div className="bg-white rounded-none shadow-md overflow-hidden">
            {filteredTasks.filter(task => task.status === 'completed').length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <CheckSquare size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Keine abgeschlossenen Aufgaben</p>
                <p className="mt-1">Du hast noch keine Aufgaben abgeschlossen.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredTasks
                  .filter(task => task.status === 'completed')
                  .map((task) => (
                    <li
                      key={task.id}
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleTaskClick(task.id)}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-1">
                          <input
                            type="checkbox"
                            checked={true}
                            readOnly
                            className="h-5 w-5 text-[var(--accent)] rounded-none border-gray-300 focus:ring-[var(--accent)]"
                          />
                        </div>
                        <div className="ml-3 flex-grow">
                          <p className="text-gray-500 font-medium line-through">
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-gray-400 text-sm mt-1 line-clamp-2 line-through">
                              {task.description}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge className="rounded-none font-medium bg-green-100 text-green-800">
                              Abgeschlossen
                            </Badge>
                            <div className="flex items-center text-xs text-gray-400">
                              <Clock size={14} className="mr-1" />
                              <span>Abgeschlossen {task.completed_at ? formatDate(task.completed_at) : 'kürzlich'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
