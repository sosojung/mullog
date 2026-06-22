import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/use-theme';
import { Spacing, BottomTabInset } from '../constants/theme';
import { useWaterStore } from '../store/waterStore';
import { getTodayTotal, getProgressPercent } from '../utils/calculateProgress';
import { WaterButton } from '../components/WaterButton';
import { ProgressBar } from '../components/ProgressBar';

export default function HomeScreen() {
  const colors = useTheme();
  const { records, dailyGoal, addWater, setGoal } = useWaterStore();

  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [goalInput, setGoalInput] = useState('');

  const todayTotal = getTodayTotal(records);
  const percent = getProgressPercent(todayTotal, dailyGoal);
  const remaining = Math.max(0, dailyGoal - todayTotal);

  const todayRecords = [...records]
    .filter(r => new Date(r.timestamp).toDateString() === new Date().toDateString())
    .reverse();

  async function handleCustomAdd() {
    const amount = parseInt(customInput, 10);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('올바른 양을 입력해주세요.');
      return;
    }
    await addWater(amount);
    setCustomInput('');
    setCustomModalVisible(false);
  }

  async function handleSetGoal() {
    const goal = parseInt(goalInput, 10);
    if (isNaN(goal) || goal <= 0) {
      Alert.alert('올바른 목표량을 입력해주세요.');
      return;
    }
    await setGoal(goal);
    setGoalInput('');
    setGoalModalVisible(false);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>물로그</Text>
          <Pressable onPress={() => { setGoalInput(String(dailyGoal)); setGoalModalVisible(true); }}>
            <Text style={[styles.goalChip, { color: colors.textSecondary, backgroundColor: colors.backgroundElement }]}>
              목표 {dailyGoal}ml
            </Text>
          </Pressable>
        </View>

        <View style={styles.amountBox}>
          <Text style={[styles.amountValue, { color: colors.text }]}>{todayTotal}</Text>
          <Text style={[styles.amountUnit, { color: colors.textSecondary }]}>ml</Text>
        </View>

        {percent >= 100 ? (
          <Text style={[styles.statusText, { color: '#34C759' }]}>목표 달성!</Text>
        ) : (
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            {remaining}ml 더 마시면 목표 달성
          </Text>
        )}

        <View style={styles.progressSection}>
          <ProgressBar percent={percent} current={todayTotal} goal={dailyGoal} />
        </View>

        <View style={styles.buttons}>
          <WaterButton label="+200ml" onPress={() => addWater(200)} />
          <WaterButton label="+300ml" onPress={() => addWater(300)} />
          <WaterButton label="직접 입력" onPress={() => setCustomModalVisible(true)} />
        </View>

        {todayRecords.length > 0 && (
          <View style={styles.historySection}>
            <Text style={[styles.historyTitle, { color: colors.textSecondary }]}>오늘 기록</Text>
            {todayRecords.map(r => (
              <View key={r.id} style={[styles.historyItem, { backgroundColor: colors.backgroundElement }]}>
                <Text style={[styles.historyAmount, { color: colors.text }]}>{r.amount}ml</Text>
                <Text style={[styles.historyTime, { color: colors.textSecondary }]}>
                  {new Date(r.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: BottomTabInset }} />
      </ScrollView>

      <Modal visible={customModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>직접 입력</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]}
              keyboardType="numeric"
              placeholder="ml 단위로 입력"
              placeholderTextColor={colors.textSecondary}
              value={customInput}
              onChangeText={setCustomInput}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalBtn, { backgroundColor: colors.backgroundSelected }]} onPress={() => { setCustomInput(''); setCustomModalVisible(false); }}>
                <Text style={{ color: colors.text }}>취소</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: '#007AFF' }]} onPress={handleCustomAdd}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>추가</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={goalModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>목표 설정</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]}
              keyboardType="numeric"
              placeholder="목표 ml 입력"
              placeholderTextColor={colors.textSecondary}
              value={goalInput}
              onChangeText={setGoalInput}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalBtn, { backgroundColor: colors.backgroundSelected }]} onPress={() => { setGoalInput(''); setGoalModalVisible(false); }}>
                <Text style={{ color: colors.text }}>취소</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: '#007AFF' }]} onPress={handleSetGoal}>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  title: { fontSize: 28, fontWeight: '700' },
  goalChip: {
    fontSize: 13,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 8,
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  amountValue: { fontSize: 72, fontWeight: '700', lineHeight: 80 },
  amountUnit: { fontSize: 24, marginBottom: 10, marginLeft: 4 },
  statusText: { textAlign: 'center', fontSize: 14, marginBottom: Spacing.three },
  progressSection: { marginBottom: Spacing.four },
  buttons: { flexDirection: 'row', marginBottom: Spacing.five },
  historySection: { gap: Spacing.two },
  historyTitle: { fontSize: 13, fontWeight: '600', marginBottom: Spacing.one },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 10,
  },
  historyAmount: { fontSize: 15, fontWeight: '600' },
  historyTime: { fontSize: 13 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: Spacing.two,
    fontSize: 16,
  },
  modalButtons: { flexDirection: 'row', gap: Spacing.two },
  modalBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: 10,
  },
});
