import { create } from 'zustand';
import { WaterRecord } from '../types/water';
import { loadWaterData, saveWaterData, loadButtonAmounts, saveButtonAmounts } from '../services/storageService';

type WaterStore = {
  records: WaterRecord[];
  dailyGoal: number;
  buttonAmounts: [number, number];
  isLoaded: boolean;
  loadFromStorage: () => Promise<void>;
  addWater: (amount: number) => Promise<void>;
  setGoal: (goal: number) => Promise<void>;
  setButtonAmounts: (amounts: [number, number]) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
};

export const useWaterStore = create<WaterStore>((set, get) => ({
  records: [],
  dailyGoal: 2000,
  buttonAmounts: [200, 300],
  isLoaded: false,

  loadFromStorage: async () => {
    const data = await loadWaterData();
    const buttonAmounts = await loadButtonAmounts();
    set({ records: data.records, dailyGoal: data.dailyGoal, buttonAmounts, isLoaded: true });
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

  setButtonAmounts: async (amounts) => {
    set({ buttonAmounts: amounts });
    await saveButtonAmounts(amounts);
  },

  deleteRecord: async (id) => {
    const records = get().records.filter(r => r.id !== id);
    set({ records });
    await saveWaterData({ records, dailyGoal: get().dailyGoal });
  },
}));
