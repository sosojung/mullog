import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/use-theme';
import { Spacing } from '../constants/theme';
import { AppColors, GOAL_PRESETS } from '../constants/colors';
import { useWaterStore } from '../store/waterStore';
import { useOnboardingStore } from '../store/onboardingStore';

type Props = {
  onStart: () => void;
};

export default function OnboardingScreen({ onStart }: Props) {
  const colors = useTheme();
  const { setGoal } = useWaterStore();
  const { completeOnboarding } = useOnboardingStore();
  const [goalInput, setGoalInput] = useState('2000');

  async function handleStart() {
    const goal = parseInt(goalInput, 10);
    if (isNaN(goal) || goal <= 0) {
      Alert.alert('올바른 목표량을 입력해주세요.');
      return;
    }
    await setGoal(goal);
    onStart();
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >
        <View style={styles.topSection}>
          <Text style={styles.emoji}>💧</Text>
          <Text style={[styles.title, { color: colors.text }]}>물로그에{'\n'}오신 걸 환영해요!</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            하루 목표 수분 섭취량을 설정하면{'\n'}달성률을 바로 확인할 수 있어요.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>하루 목표 섭취량</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]}
              keyboardType="numeric"
              value={goalInput}
              onChangeText={setGoalInput}
              selectTextOnFocus
            />
            <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>ml</Text>
          </View>
          <View style={styles.presets}>
            {GOAL_PRESETS.map(v => (
              <Pressable
                key={v}
                style={[
                  styles.presetBtn,
                  {
                    backgroundColor: goalInput === String(v) ? AppColors.primary : colors.backgroundSelected,
                  },
                ]}
                onPress={() => setGoalInput(String(v))}
              >
                <Text style={{ color: goalInput === String(v) ? '#fff' : colors.textSecondary, fontSize: 13 }}>
                  {v}ml
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.startBtn, { opacity: pressed ? 0.8 : 1 }]}
          onPress={handleStart}
        >
          <Text style={styles.startBtnText}>시작하기</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    padding: Spacing.three,
    justifyContent: 'center',
    gap: Spacing.four,
  },
  topSection: { alignItems: 'center', gap: Spacing.two },
  emoji: { fontSize: 64 },
  title: { fontSize: 32, fontWeight: '700', textAlign: 'center', lineHeight: 42 },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  card: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardLabel: { fontSize: 13, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: Spacing.two,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  inputUnit: { fontSize: 18, fontWeight: '600' },
  presets: { flexDirection: 'row', gap: Spacing.two },
  presetBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.one,
    borderRadius: 8,
  },
  startBtn: {
    backgroundColor: AppColors.primary,
    borderRadius: 14,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  startBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
