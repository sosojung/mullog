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
  const [showOnboarding, setShowOnboarding] = useState(true);
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

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />

      {/* 온보딩: 홈 화면 위에 풀스크린으로 덮기 */}
      {!isOnboarded && showOnboarding && (
        <OnboardingScreen
          onStart={async () => {
            setShowOnboarding(false);
            setShowTutorial(true);
          }}
        />
      )}

      {/* 튜토리얼: 홈 화면이 뒤에 보이는 상태로 오버레이 */}
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
