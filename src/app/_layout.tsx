import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useEffect, useState } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { useWaterStore } from '@/store/waterStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import OnboardingScreen from './onboarding';
import { TutorialOverlay } from '@/components/TutorialOverlay';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const loadWater = useWaterStore(s => s.loadFromStorage);
  const { isOnboarded, isLoaded, loadFromStorage, completeOnboarding } = useOnboardingStore();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    Promise.all([loadFromStorage(), loadWater()]);
  }, []);

  if (!isLoaded) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
      </ThemeProvider>
    );
  }

  if (!isOnboarded) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <OnboardingScreen onStart={() => setShowTutorial(true)} />
        <TutorialOverlay
          visible={showTutorial}
          onComplete={async () => {
            setShowTutorial(false);
            await completeOnboarding();
          }}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
