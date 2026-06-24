import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleWaterReminders, cancelAllReminders } from '../services/notificationService';

const STORAGE_KEY = '@mullog/notifications';

type NotificationStore = {
  enabled: boolean;
  intervalHours: number;
  isLoaded: boolean;
  loadFromStorage: () => Promise<void>;
  toggleEnabled: () => Promise<void>;
  setIntervalHours: (hours: number) => Promise<void>;
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  enabled: false,
  intervalHours: 2,
  isLoaded: false,

  loadFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { enabled, intervalHours } = JSON.parse(raw);
        set({ enabled, intervalHours, isLoaded: true });
        if (enabled) {
          await scheduleWaterReminders(intervalHours);
        }
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  toggleEnabled: async () => {
    const { enabled, intervalHours } = get();
    const next = !enabled;
    set({ enabled: next });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled: next, intervalHours }));
    if (next) {
      await scheduleWaterReminders(intervalHours);
    } else {
      await cancelAllReminders();
    }
  },

  setIntervalHours: async (hours) => {
    set({ intervalHours: hours });
    const { enabled } = get();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled, intervalHours: hours }));
    if (enabled) {
      await scheduleWaterReminders(hours);
    }
  },
}));
