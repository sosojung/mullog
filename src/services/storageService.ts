import AsyncStorage from '@react-native-async-storage/async-storage';
import { WaterState } from '../types/water';

const STORAGE_KEY = '@mullog/water';

const DEFAULT_STATE: WaterState = {
  records: [],
  dailyGoal: 2000,
};

export async function loadWaterData(): Promise<WaterState> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

export async function saveWaterData(state: WaterState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('물 데이터 저장 실패:', e);
    throw e;
  }
}

const BUTTON_AMOUNTS_KEY = '@mullog/buttonAmounts';

export async function loadButtonAmounts(): Promise<[number, number]> {
  try {
    const json = await AsyncStorage.getItem(BUTTON_AMOUNTS_KEY);
    return json ? JSON.parse(json) : [200, 300];
  } catch {
    return [200, 300];
  }
}

export async function saveButtonAmounts(amounts: [number, number]): Promise<void> {
  try {
    await AsyncStorage.setItem(BUTTON_AMOUNTS_KEY, JSON.stringify(amounts));
  } catch (e) {
    console.error('버튼 물량 저장 실패:', e);
  }
}

const NOTIFICATION_KEY = '@mullog/notifications';

type NotificationSettings = { enabled: boolean; intervalHours: number };

export async function loadNotificationData(): Promise<NotificationSettings | null> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveNotificationData(settings: NotificationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('알림 설정 저장 실패:', e);
  }
}

const ONBOARDING_KEY = '@mullog/onboarding';

export async function loadOnboardingData(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function saveOnboardingData(done: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, String(done));
  } catch (e) {
    console.error('온보딩 저장 실패:', e);
    throw e;
  }
}
