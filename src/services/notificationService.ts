import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 에뮬레이터/구형 기기에서 모듈 초기화 실패 방지
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (_) {}

export async function requestPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function cancelAllReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (_) {}
}

export async function scheduleWaterReminders(intervalHours: number): Promise<void> {
  if (Platform.OS === 'web') return;

  await cancelAllReminders();

  // 오전 8시 ~ 오후 10시, intervalHours 간격으로 예약
  const startHour = 8;
  const endHour = 22;

  const messages = [
    '물 마실 시간이에요! 💧 잠깐 물 한 잔 어때요?',
    '수분 보충할 시간이에요! 💧',
    '오늘 물 잘 마시고 계신가요? 💧',
    '건강을 위해 물 한 잔 마셔요! 💧',
  ];

  let msgIndex = 0;
  for (let h = startHour; h <= endHour; h += intervalHours) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '물로그',
        body: messages[msgIndex % messages.length],
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: h,
        minute: 0,
      },
    });
    msgIndex++;
  }
}
