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
import { getTodayTotal, getProgressPercent, getStreak } from '../utils/calculateProgress';
import { WaterButton } from '../components/WaterButton';
import { AnimatedWaterCup } from '../components/AnimatedWaterCup';

function getTodayLabel(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[now.getDay()];
  return `${month}월 ${day}일 ${weekday}요일`;
}

export default function HomeScreen() {
  const colors = useTheme();
  const { records, dailyGoal, addWater, setGoal, deleteRecord } = useWaterStore();

  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [goalInput, setGoalInput] = useState('');

  const todayTotal = getTodayTotal(records);
  const percent = getProgressPercent(todayTotal, dailyGoal);
  const streak = getStreak(records, dailyGoal);

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

  function confirmDelete(id: string) {
    Alert.alert('기록 삭제', '이 기록을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => deleteRecord(id) },
    ]);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>{getTodayLabel()}</Text>
            <Text style={[styles.title, { color: colors.text }]}>물로그</Text>
          </View>
          <View style={styles.headerRight}>
            {streak > 0 && (
              <View style={[styles.streakBadge, { backgroundColor: colors.backgroundElement }]}>
                <Text style={styles.streakText}>🔥 {streak}일</Text>
              </View>
            )}
            <Pressable onPress={() => { setGoalInput(String(dailyGoal)); setGoalModalVisible(true); }}>
              <Text style={[styles.goalChip, { color: colors.textSecondary, backgroundColor: colors.backgroundElement }]}>
                목표 {dailyGoal}ml
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 물컵 애니메이션 */}
        <View style={styles.cupSection}>
          <AnimatedWaterCup percent={percent} current={todayTotal} goal={dailyGoal} />
        </View>

        {/* 버튼 */}
        <View style={styles.buttons}>
          <WaterButton label="+200ml" emoji="💧" variant="primary" onPress={() => addWater(200)} />
          <WaterButton label="+300ml" emoji="💧" variant="primary" onPress={() => addWater(300)} />
          <WaterButton label="직접 입력" emoji="✏️" onPress={() => setCustomModalVisible(true)} />
        </View>

        {/* 오늘 기록 */}
        {todayRecords.length > 0 && (
          <View style={styles.historySection}>
            <Text style={[styles.historyTitle, { color: colors.textSecondary }]}>오늘 기록</Text>
            {todayRecords.map(r => (
              <View key={r.id} style={[styles.historyItem, { backgroundColor: colors.backgroundElement }]}>
                <Text style={[styles.historyAmount, { color: colors.text }]}>{r.amount}ml</Text>
                <View style={styles.historyRight}>
                  <Text style={[styles.historyTime, { color: colors.textSecondary }]}>
                    {new Date(r.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Pressable
                    onPress={() => confirmDelete(r.id)}
                    hitSlop={8}
                    style={styles.deleteBtn}
                  >
                    <Text style={[styles.deleteText, { color: colors.textSecondary }]}>×</Text>
                  </Pressable>
                </View>
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
            <View style={styles.presets}>
              {[1500, 2000, 2500].map(v => (
                <Pressable
                  key={v}
                  style={[
                    styles.presetBtn,
                    { backgroundColor: goalInput === String(v) ? '#007AFF' : colors.backgroundSelected },
                  ]}
                  onPress={() => setGoalInput(String(v))}
                >
                  <Text style={{ color: goalInput === String(v) ? '#fff' : colors.textSecondary, fontSize: 13 }}>
                    {v}ml
                  </Text>
                </Pressable>
              ))}
            </View>
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
    alignItems: 'flex-start',
    marginBottom: Spacing.four,
  },
  dateLabel: { fontSize: 13, marginBottom: 2 },
  title: { fontSize: 28, fontWeight: '700' },
  headerRight: { alignItems: 'flex-end', gap: Spacing.one },
  streakBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 8,
  },
  streakText: { fontSize: 13, fontWeight: '600' },
  goalChip: {
    fontSize: 13,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 8,
  },
  cupSection: {
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
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
  historyRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  historyTime: { fontSize: 13 },
  deleteBtn: { padding: 4 },
  deleteText: { fontSize: 18, fontWeight: '300', lineHeight: 20 },
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
  presets: { flexDirection: 'row', gap: Spacing.two },
  presetBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.one,
    borderRadius: 8,
  },
  modalButtons: { flexDirection: 'row', gap: Spacing.two },
  modalBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: 10,
  },
});
