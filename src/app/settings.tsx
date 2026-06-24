import { View, Text, StyleSheet, Switch, Pressable, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/use-theme';
import { Spacing, BottomTabInset } from '../constants/theme';
import { useNotificationStore } from '../store/notificationStore';
import { requestPermission } from '../services/notificationService';

const INTERVAL_OPTIONS = [1, 2, 3];

export default function SettingsScreen() {
  const colors = useTheme();
  const { enabled, intervalHours, toggleEnabled, setIntervalHours } = useNotificationStore();

  async function handleToggle() {
    if (!enabled) {
      if (Platform.OS !== 'web') {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert('알림 권한 필요', '설정 앱에서 알림 권한을 허용해주세요.');
          return;
        }
      }
    }
    await toggleEnabled();
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.scroll}>
        <Text style={[styles.title, { color: colors.text }]}>설정</Text>

        <View style={[styles.section, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>알림</Text>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>물 마시기 알림</Text>
              <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>
                설정한 간격마다 물 마실 시간을 알려드려요
              </Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={handleToggle}
              trackColor={{ true: '#007AFF' }}
            />
          </View>

          {enabled && (
            <View style={styles.intervalSection}>
              <Text style={[styles.intervalLabel, { color: colors.textSecondary }]}>알림 간격</Text>
              <View style={styles.intervalButtons}>
                {INTERVAL_OPTIONS.map(h => (
                  <Pressable
                    key={h}
                    style={[
                      styles.intervalBtn,
                      {
                        backgroundColor: intervalHours === h ? '#007AFF' : colors.backgroundSelected,
                      },
                    ]}
                    onPress={() => setIntervalHours(h)}
                  >
                    <Text
                      style={[
                        styles.intervalBtnText,
                        { color: intervalHours === h ? '#fff' : colors.textSecondary },
                      ]}
                    >
                      {h}시간
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text style={[styles.intervalNote, { color: colors.textSecondary }]}>
                오전 8시 ~ 오후 10시 사이에 알림을 보내드려요
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={{ height: BottomTabInset }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.three },
  title: { fontSize: 28, fontWeight: '700', marginBottom: Spacing.four },
  section: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  sectionTitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  rowLeft: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 16, fontWeight: '500' },
  rowDesc: { fontSize: 13, lineHeight: 18 },
  intervalSection: { gap: Spacing.two },
  intervalLabel: { fontSize: 13, fontWeight: '500' },
  intervalButtons: { flexDirection: 'row', gap: Spacing.two },
  intervalBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: 10,
  },
  intervalBtnText: { fontSize: 14, fontWeight: '600' },
  intervalNote: { fontSize: 12, lineHeight: 16 },
});
