import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { schedulerService } from '@/lib/scheduler/SchedulerService';
import { pipelineManager } from '@/lib/scheduler/PipelineManager';
import { syncSettingsService } from '@/lib/scheduler/SyncSettingsService';
import {
  ScheduledTask,
  PostPipelineItem,
  SyncSettings,
  EntityType,
  PipelineStatus,
  SocialMediaPlatform,
  TaskStatus,
  PipelineType,
  SocialMediaPostConfig,
  MovidoPostConfig
} from '@/types/scheduler';

export interface SchedulerState {
  // Scheduler State
  tasks: ScheduledTask[];
  pendingTasks: ScheduledTask[];
  dueTasks: ScheduledTask[];
  isLoadingTasks: boolean;
  
  // Pipeline State
  pipelineItems: PostPipelineItem[];
  socialMediaItems: PostPipelineItem[];
  movidoItems: PostPipelineItem[];
  isLoadingPipeline: boolean;
  
  // Sync Settings State
  syncSettings: SyncSettings[];
  activeSyncSettings: SyncSettings[];
  isLoadingSyncSettings: boolean;
  
  // Scheduler Actions
  loadTasks: (options?: {
    status?: TaskStatus | TaskStatus[];
    entityType?: EntityType;
    entityId?: string;
    limit?: number;
  }) => Promise<void>;
  loadPendingTasks: (limit?: number) => Promise<void>;
  loadDueTasks: () => Promise<void>;
  createTask: (taskData: Omit<ScheduledTask, "id" | "createdAt" | "updatedAt">) => Promise<string | null>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  triggerSchedulerRun: () => Promise<void>;
  
  // Pipeline Actions
  loadPipelineItems: (options?: {
    status?: PipelineStatus | PipelineStatus[];
    pipelineType?: PipelineType;
    platform?: SocialMediaPlatform;
    entityType?: EntityType;
    entityId?: string;
    limit?: number;
  }) => Promise<void>;
  loadSocialMediaItems: (
    status?: PipelineStatus | PipelineStatus[],
    limit?: number
  ) => Promise<void>;
  loadMovidoItems: (
    status?: PipelineStatus | PipelineStatus[],
    limit?: number
  ) => Promise<void>;
  createSocialMediaPostItem: (
    entityType: EntityType,
    entityId: string,
    platform: SocialMediaPlatform,
    postConfig: SocialMediaPostConfig,
    priority?: number
  ) => Promise<string | null>;
  createMovidoPostItem: (
    entityType: EntityType,
    entityId: string,
    postConfig: MovidoPostConfig,
    priority?: number
  ) => Promise<string | null>;
  removeFromPipeline: (itemId: string) => Promise<boolean>;
  
  // Sync Settings Actions
  loadSyncSettings: (
    entityType?: EntityType,
    enabled?: boolean
  ) => Promise<void>;
  loadActiveSyncSettings: () => Promise<void>;
  saveSyncSettings: (
    settings: Omit<SyncSettings, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<string | null>;
  setSyncEnabled: (
    entityType: EntityType,
    entityId: string,
    enabled: boolean
  ) => Promise<boolean>;
  deleteSyncSettings: (
    entityType: EntityType,
    entityId: string
  ) => Promise<boolean>;
  triggerSyncNow: (
    entityType: EntityType,
    entityId: string
  ) => Promise<string | null>;
}

export const useSchedulerStore = create<SchedulerState>()(
  devtools(
    (set, get) => ({
      // Initial State
      tasks: [],
      pendingTasks: [],
      dueTasks: [],
      isLoadingTasks: false,
      
      pipelineItems: [],
      socialMediaItems: [],
      movidoItems: [],
      isLoadingPipeline: false,
      
      syncSettings: [],
      activeSyncSettings: [],
      isLoadingSyncSettings: false,
      
      // Scheduler Actions
      loadTasks: async (options = {}) => {
        set({ isLoadingTasks: true });
        try {
          const tasks = await schedulerService.getTasks(options);
          set({ tasks, isLoadingTasks: false });
        } catch (error) {
          console.error('Fehler beim Laden der Aufgaben:', error);
          set({ isLoadingTasks: false });
        }
      },
      
      loadPendingTasks: async (limit = 10) => {
        set({ isLoadingTasks: true });
        try {
          const pendingTasks = await schedulerService.getNextPendingTasks(limit);
          set({ pendingTasks, isLoadingTasks: false });
        } catch (error) {
          console.error('Fehler beim Laden der anstehenden Aufgaben:', error);
          set({ isLoadingTasks: false });
        }
      },
      
      loadDueTasks: async () => {
        set({ isLoadingTasks: true });
        try {
          const dueTasks = await schedulerService.getDueTasks();
          set({ dueTasks, isLoadingTasks: false });
        } catch (error) {
          console.error('Fehler beim Laden der fälligen Aufgaben:', error);
          set({ isLoadingTasks: false });
        }
      },
      
      createTask: async (taskData) => {
        try {
          const taskId = await schedulerService.createTask(taskData);
          await get().loadTasks();
          return taskId;
        } catch (error) {
          console.error('Fehler beim Erstellen der Aufgabe:', error);
          return null;
        }
      },
      
      updateTaskStatus: async (taskId, status) => {
        try {
          const success = await schedulerService.updateTaskStatus(
            taskId,
            status
          );
          
          if (success) {
            await get().loadTasks();
          }
          
          return success;
        } catch (error) {
          console.error('Fehler beim Aktualisieren des Aufgabenstatus:', error);
          return false;
        }
      },
      
      deleteTask: async (taskId) => {
        try {
          const success = await schedulerService.deleteTask(taskId);
          
          if (success) {
            await get().loadTasks();
          }
          
          return success;
        } catch (error) {
          console.error('Fehler beim Löschen der Aufgabe:', error);
          return false;
        }
      },
      
      triggerSchedulerRun: async () => {
        try {
          await get().loadDueTasks();
          const { dueTasks } = get();
          
          // Verarbeite alle fälligen Aufgaben
          for (const task of dueTasks) {
            await schedulerService.updateTaskStatus(task.id, 'running');
            
            // In einer vollständigen Implementierung würden hier die Aufgaben ausgeführt
            
            await schedulerService.updateTaskStatus(
              task.id,
              'completed',
              JSON.stringify({ success: true, message: 'Aufgabe erfolgreich ausgeführt' })
            );
          }
          
          // Aktualisiere die Listen
          await get().loadTasks();
          await get().loadPendingTasks();
          await get().loadDueTasks();
        } catch (error) {
          console.error('Fehler beim Ausführen des Scheduler-Laufs:', error);
        }
      },
      
      // Pipeline Actions
      loadPipelineItems: async (options = {}) => {
        set({ isLoadingPipeline: true });
        try {
          const pipelineItems = await pipelineManager.getItems(options);
          set({ pipelineItems, isLoadingPipeline: false });
        } catch (error) {
          console.error('Fehler beim Laden der Pipeline-Items:', error);
          set({ isLoadingPipeline: false });
        }
      },
      
      loadSocialMediaItems: async (status = 'pending', limit = 10) => {
        set({ isLoadingPipeline: true });
        try {
          const socialMediaItems = await pipelineManager.getItems({
            pipelineType: 'social_media',
            status,
            limit
          });
          
          set({ socialMediaItems, isLoadingPipeline: false });
        } catch (error) {
          console.error('Fehler beim Laden der Social Media Items:', error);
          set({ isLoadingPipeline: false });
        }
      },
      
      loadMovidoItems: async (status = 'pending', limit = 10) => {
        set({ isLoadingPipeline: true });
        try {
          const movidoItems = await pipelineManager.getItems({
            pipelineType: 'movido',
            status,
            limit
          });
          
          set({ movidoItems, isLoadingPipeline: false });
        } catch (error) {
          console.error('Fehler beim Laden der Movido Items:', error);
          set({ isLoadingPipeline: false });
        }
      },
      
      createSocialMediaPostItem: async (
        entityType,
        entityId,
        platform,
        postConfig,
        priority = 0
      ) => {
        try {
          const itemId = await pipelineManager.createSocialMediaPostItem(
            entityType,
            entityId,
            platform,
            postConfig,
            priority
          );
          
          await get().loadSocialMediaItems();
          return itemId;
        } catch (error) {
          console.error('Fehler beim Erstellen des Social Media Post Items:', error);
          return null;
        }
      },
      
      createMovidoPostItem: async (
        entityType,
        entityId,
        postConfig,
        priority = 0
      ) => {
        try {
          const itemId = await pipelineManager.createMovidoPostItem(
            entityType,
            entityId,
            postConfig,
            priority
          );
          
          await get().loadMovidoItems();
          return itemId;
        } catch (error) {
          console.error('Fehler beim Erstellen des Movido Post Items:', error);
          return null;
        }
      },
      
      removeFromPipeline: async (itemId) => {
        try {
          const success = await pipelineManager.removeFromPipeline(itemId);
          
          if (success) {
            await get().loadPipelineItems();
            await get().loadSocialMediaItems();
            await get().loadMovidoItems();
          }
          
          return success;
        } catch (error) {
          console.error('Fehler beim Entfernen des Items aus der Pipeline:', error);
          return false;
        }
      },
      
      // Sync Settings Actions
      loadSyncSettings: async (entityType, enabled) => {
        set({ isLoadingSyncSettings: true });
        try {
          const syncSettings = await syncSettingsService.getAllSyncSettings(
            entityType,
            enabled
          );
          
          set({ syncSettings, isLoadingSyncSettings: false });
        } catch (error) {
          console.error('Fehler beim Laden der Synchronisationseinstellungen:', error);
          set({ isLoadingSyncSettings: false });
        }
      },
      
      loadActiveSyncSettings: async () => {
        set({ isLoadingSyncSettings: true });
        try {
          const activeSyncSettings = await syncSettingsService.getAllSyncSettings(
            undefined,
            true
          );
          
          set({ activeSyncSettings, isLoadingSyncSettings: false });
        } catch (error) {
          console.error('Fehler beim Laden der aktiven Synchronisationseinstellungen:', error);
          set({ isLoadingSyncSettings: false });
        }
      },
      
      saveSyncSettings: async (settings) => {
        try {
          const settingsId = await syncSettingsService.saveSyncSettings(settings);
          await get().loadSyncSettings();
          await get().loadActiveSyncSettings();
          return settingsId;
        } catch (error) {
          console.error('Fehler beim Speichern der Synchronisationseinstellungen:', error);
          return null;
        }
      },
      
      setSyncEnabled: async (entityType, entityId, enabled) => {
        try {
          const success = await syncSettingsService.setSyncEnabled(
            entityType,
            entityId,
            enabled
          );
          
          if (success) {
            await get().loadSyncSettings();
            await get().loadActiveSyncSettings();
          }
          
          return success;
        } catch (error) {
          console.error('Fehler beim Aktivieren/Deaktivieren der Synchronisation:', error);
          return false;
        }
      },
      
      deleteSyncSettings: async (entityType, entityId) => {
        try {
          const success = await syncSettingsService.deleteSyncSettings(
            entityType,
            entityId
          );
          
          if (success) {
            await get().loadSyncSettings();
            await get().loadActiveSyncSettings();
          }
          
          return success;
        } catch (error) {
          console.error('Fehler beim Löschen der Synchronisationseinstellungen:', error);
          return false;
        }
      },
      
      triggerSyncNow: async (entityType, entityId) => {
        try {
          const taskId = await syncSettingsService.triggerSync(entityType, entityId);
          await get().loadTasks();
          return taskId;
        } catch (error) {
          console.error('Fehler beim Auslösen der sofortigen Synchronisation:', error);
          return null;
        }
      }
    }),
    { name: 'scheduler-store' }
  )
);
