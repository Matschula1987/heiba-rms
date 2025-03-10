import { create } from 'zustand'
import { DashboardStats } from '@/types'

interface DashboardStore {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  stats: null,
  isLoading: false,
  error: null,
  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      set({ stats: data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      set({ error: 'Failed to fetch dashboard stats', isLoading: false });
    }
  },
}));