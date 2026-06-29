import { create } from 'zustand';
import { loadNotificationData, saveNotificationData } from '../services/storageService';
import { scheduleWaterReminders, cancelAllReminders } from '../services/notificationService';

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
      const data = await loadNotificationData();
      if (data) {
        set({ enabled: data.enabled, intervalHours: data.intervalHours, isLoaded: true });
        if (data.enabled) {
          await scheduleWaterReminders(data.intervalHours);
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
    await saveNotificationData({ enabled: next, intervalHours });
    if (next) {
      await scheduleWaterReminders(intervalHours);
    } else {
      await cancelAllReminders();
    }
  },

  setIntervalHours: async (hours) => {
    set({ intervalHours: hours });
    const { enabled } = get();
    await saveNotificationData({ enabled, intervalHours: hours });
    if (enabled) {
      await scheduleWaterReminders(hours);
    }
  },
}));
