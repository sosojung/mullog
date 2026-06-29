import { View, Text, StyleSheet, Switch, Pressable, Platform, Alert, TextInput, Modal, KeyboardAvoidingView, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useTheme } from '../hooks/use-theme';
import { Spacing, BottomTabInset } from '../constants/theme';
import { useNotificationStore } from '../store/notificationStore';
import { useWaterStore } from '../store/waterStore';
import { requestPermission } from '../services/notificationService';
import { formatMl } from '../utils/calculateProgress';
import { AppColors } from '../constants/colors';

const INTERVAL_OPTIONS = [1, 2, 3];

export default function SettingsScreen() {
  const colors = useTheme();
  const { enabled, intervalHours, toggleEnabled, setIntervalHours } = useNotificationStore();
  const { buttonAmounts, setButtonAmounts } = useWaterStore();

  const [editingIndex, setEditingIndex] = useState<0 | 1 | null>(null);
  const [editInput, setEditInput] = useState('');

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

  function openEdit(index: 0 | 1) {
    setEditInput(String(buttonAmounts[index]));
    setEditingIndex(index);
  }

  async function handleSaveAmount() {
    const amount = parseInt(editInput, 10);
    if (isNaN(amount) || amount <= 0 || amount > 9999) {
      Alert.alert('올바른 값을 입력해주세요.', '1 ~ 9,999ml 사이로 입력해주세요.');
      return;
    }
    const next: [number, number] = editingIndex === 0
      ? [amount, buttonAmounts[1]]
      : [buttonAmounts[0], amount];
    await setButtonAmounts(next);
    setEditingIndex(null);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: colors.text }]}>설정</Text>

        {/* 버튼 물량 설정 */}
        <View style={[styles.section, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>빠른 기록 버튼</Text>
          <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
            홈 화면 버튼 1, 2의 물량을 설정해요
          </Text>
          <View style={styles.buttonAmountRow}>
            {([0, 1] as const).map(i => (
              <Pressable
                key={i}
                style={[styles.amountCard, { backgroundColor: colors.backgroundSelected }]}
                onPress={() => openEdit(i)}
              >
                <Text style={[styles.amountCardLabel, { color: colors.textSecondary }]}>버튼 {i + 1}</Text>
                <Text style={[styles.amountCardValue, { color: colors.text }]}>
                  {formatMl(buttonAmounts[i])}
                  <Text style={[styles.amountCardUnit, { color: colors.textSecondary }]}>ml</Text>
                </Text>
                <Text style={[styles.amountCardEdit, { color: AppColors.primary }]}>수정 ›</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ height: Spacing.three }} />

        {/* 알림 설정 */}
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
              trackColor={{ true: AppColors.primary }}
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
                      { backgroundColor: intervalHours === h ? AppColors.primary : colors.backgroundSelected },
                    ]}
                    onPress={() => setIntervalHours(h)}
                  >
                    <Text style={[styles.intervalBtnText, { color: intervalHours === h ? '#fff' : colors.textSecondary }]}>
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

        <View style={{ height: BottomTabInset }} />
      </ScrollView>

      {/* 물량 수정 모달 */}
      <Modal visible={editingIndex !== null} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              버튼 {editingIndex !== null ? editingIndex + 1 : ''} 물량 설정
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]}
              keyboardType="numeric"
              placeholder="ml 입력"
              placeholderTextColor={colors.textSecondary}
              value={editInput}
              onChangeText={setEditInput}
              autoFocus
            />
            <View style={styles.presets}>
              {[100, 150, 200, 250, 300, 350, 400, 500].map(v => (
                <Pressable
                  key={v}
                  style={[styles.presetBtn, { backgroundColor: editInput === String(v) ? AppColors.primary : colors.backgroundSelected }]}
                  onPress={() => setEditInput(String(v))}
                >
                  <Text style={{ color: editInput === String(v) ? '#fff' : colors.textSecondary, fontSize: 13 }}>
                    {v}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalBtn, { backgroundColor: colors.backgroundSelected }]} onPress={() => setEditingIndex(null)}>
                <Text style={{ color: colors.text }}>취소</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: AppColors.primary }]} onPress={handleSaveAmount}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>저장</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.three },
  title: { fontSize: 28, fontWeight: '700', marginBottom: Spacing.four },
  section: { borderRadius: 16, padding: Spacing.three, gap: Spacing.three },
  sectionTitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionDesc: { fontSize: 13, marginTop: -Spacing.two },
  buttonAmountRow: { flexDirection: 'row', gap: Spacing.two },
  amountCard: {
    flex: 1,
    borderRadius: 12,
    padding: Spacing.two,
    gap: 4,
    alignItems: 'center',
  },
  amountCardLabel: { fontSize: 12 },
  amountCardValue: { fontSize: 22, fontWeight: '700' },
  amountCardUnit: { fontSize: 13, fontWeight: '400' },
  amountCardEdit: { fontSize: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  rowLeft: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 16, fontWeight: '500' },
  rowDesc: { fontSize: 13, lineHeight: 18 },
  intervalSection: { gap: Spacing.two },
  intervalLabel: { fontSize: 13, fontWeight: '500' },
  intervalButtons: { flexDirection: 'row', gap: Spacing.two },
  intervalBtn: { flex: 1, alignItems: 'center', paddingVertical: Spacing.two, borderRadius: 10 },
  intervalBtnText: { fontSize: 14, fontWeight: '600' },
  intervalNote: { fontSize: 12, lineHeight: 16 },
  modalOverlay: { flex: 1, backgroundColor: AppColors.overlay, justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '85%', borderRadius: 16, padding: Spacing.four, gap: Spacing.three },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  input: { borderWidth: 1, borderRadius: 10, padding: Spacing.two, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  presetBtn: { paddingHorizontal: Spacing.two, paddingVertical: Spacing.one, borderRadius: 8 },
  modalButtons: { flexDirection: 'row', gap: Spacing.two },
  modalBtn: { flex: 1, alignItems: 'center', paddingVertical: Spacing.two, borderRadius: 10 },
});
