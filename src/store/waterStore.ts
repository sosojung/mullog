import { create } from 'zustand';
import { WaterRecord } from '../types/water';
import { loadWaterData, saveWaterData } from '../services/storageService';

type WaterStore = {
  records: WaterRecord[];
  dailyGoal: number;
  isLoaded: boolean;
  loadFromStorage: () => Promise<void>;
  addWater: (amount: number) => Promise<void>;
  setGoal: (goal: number) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
};

export const useWaterStore = create<WaterStore>((set, get) => ({
  records: [],
  dailyGoal: 2000,
  isLoaded: false,

  loadFromStorage: async () => {
    const data = await loadWaterData();
    set({ records: data.records, dailyGoal: data.dailyGoal, isLoaded: true });
  },

  addWater: async (amount) => {
    const record: WaterRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      amount,
      timestamp: Date.now(),
    };
    const records = [...get().records, record];
    set({ records });
    await saveWaterData({ records, dailyGoal: get().dailyGoal });
  },

  setGoal: async (goal) => {
    set({ dailyGoal: goal });
    await saveWaterData({ records: get().records, dailyGoal: goal });
  },

  deleteRecord: async (id) => {
    const records = get().records.filter(r => r.id !== id);
    set({ records });
    await saveWaterData({ records, dailyGoal: get().dailyGoal });
  },
}));
