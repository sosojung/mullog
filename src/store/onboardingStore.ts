import { create } from 'zustand';
import { loadOnboardingData, saveOnboardingData } from '../services/storageService';

type OnboardingStore = {
  isOnboarded: boolean;
  isLoaded: boolean;
  loadFromStorage: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  isOnboarded: false,
  isLoaded: false,

  loadFromStorage: async () => {
    const isOnboarded = await loadOnboardingData();
    set({ isOnboarded, isLoaded: true });
  },

  completeOnboarding: async () => {
    await saveOnboardingData(true);
    set({ isOnboarded: true });
  },
}));
