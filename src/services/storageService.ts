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
