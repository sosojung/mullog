import { DarkTheme, DefaultTheme, ThemeProvider, useRouter } from 'expo-router';
import { useColorScheme, View, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { useWaterStore } from '@/store/waterStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useNotificationStore } from '@/store/notificationStore';
import OnboardingScreen from './onboarding';
import { TutorialOverlay } from '@/components/TutorialOverlay';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const loadWater = useWaterStore(s => s.loadFromStorage);
  const { isOnboarded, isLoaded, loadFromStorage, completeOnboarding } = useOnboardingStore();
  const loadNotifications = useNotificationStore(s => s.loadFromStorage);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    Promise.all([loadFromStorage(), loadWater(), loadNotifications()]);
  }, [loadFromStorage, loadWater, loadNotifications]);

  if (!isLoaded) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={StyleSheet.absoluteFill}>
        <AppTabs />

        {/* 온보딩: 홈 화면 위에 풀스크린으로 덮기 */}
        {!isOnboarded && showOnboarding && (
          <View style={StyleSheet.absoluteFill}>
            <OnboardingScreen
              onStart={async () => {
                setShowOnboarding(false);
                router.replace('/');
                setShowTutorial(true);
              }}
            />
          </View>
        )}

        {/* 튜토리얼: 홈 화면이 뒤에 보이는 상태로 오버레이 */}
        <TutorialOverlay
          visible={showTutorial}
          onComplete={async () => {
            setShowTutorial(false);
            await completeOnboarding();
          }}
        />
      </View>
      <AnimatedSplashOverlay />
    </ThemeProvider>
  );
}
