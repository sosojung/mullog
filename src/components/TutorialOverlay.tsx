import { View, Text, StyleSheet, Pressable, Modal, Dimensions } from 'react-native';
import { useTheme } from '../hooks/use-theme';
import { Spacing } from '../constants/theme';

const STEPS = [
  {
    title: '오늘 섭취량',
    description: '오늘 마신 물의 총량이 여기에 표시돼요.',
    position: 'bottom',
    top: 0.22,
  },
  {
    title: '달성률 바',
    description: '목표 대비 달성률을 한눈에 확인하세요.',
    position: 'bottom',
    top: 0.45,
  },
  {
    title: '빠른 기록 버튼',
    description: '+200ml, +300ml 버튼을 누르면 바로 기록돼요.',
    position: 'top',
    top: 0.62,
  },
  {
    title: '직접 입력',
    description: '다른 양은 직접 입력해서 기록할 수 있어요.',
    position: 'top',
    top: 0.62,
  },
  {
    title: '통계 탭',
    description: '아래 통계 탭에서 최근 7일 기록을 확인하세요.',
    position: 'top',
    top: 0.82,
  },
];

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = {
  visible: boolean;
  onComplete: () => void;
};

export function TutorialOverlay({ visible, onComplete }: Props) {
  const colors = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      {visible && <TutorialContent colors={colors} onComplete={onComplete} />}
    </Modal>
  );
}

function TutorialContent({ colors, onComplete }: { colors: ReturnType<typeof useTheme>; onComplete: () => void }) {
  const [step, setStep] = require('react').useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const tooltipTop = current.position === 'bottom'
    ? current.top * SCREEN_HEIGHT + 20
    : current.top * SCREEN_HEIGHT - 130;

  return (
    <View style={styles.overlay}>
      {/* 하이라이트 영역 표시선 */}
      <View
        style={[
          styles.highlight,
          { top: current.top * SCREEN_HEIGHT - 10 },
        ]}
      />

      {/* 말풍선 */}
      <View
        style={[
          styles.tooltip,
          { backgroundColor: colors.backgroundElement, top: tooltipTop },
        ]}
      >
        <Text style={[styles.tooltipTitle, { color: colors.text }]}>{current.title}</Text>
        <Text style={[styles.tooltipDesc, { color: colors.textSecondary }]}>{current.description}</Text>

        <View style={styles.tooltipFooter}>
          <Text style={[styles.stepIndicator, { color: colors.textSecondary }]}>
            {step + 1} / {STEPS.length}
          </Text>
          <Pressable
            style={[styles.nextBtn, { backgroundColor: '#007AFF' }]}
            onPress={() => isLast ? onComplete() : setStep(step + 1)}
          >
            <Text style={styles.nextBtnText}>{isLast ? '완료' : '다음'}</Text>
          </Pressable>
        </View>
      </View>

      {/* 건너뛰기 */}
      <Pressable style={styles.skipBtn} onPress={onComplete}>
        <Text style={[styles.skipText, { color: colors.textSecondary }]}>건너뛰기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  highlight: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    height: 2,
    backgroundColor: '#007AFF',
    opacity: 0.8,
  },
  tooltip: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tooltipTitle: { fontSize: 16, fontWeight: '700' },
  tooltipDesc: { fontSize: 14, lineHeight: 20 },
  tooltipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  stepIndicator: { fontSize: 13 },
  nextBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 8,
  },
  nextBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  skipBtn: {
    position: 'absolute',
    top: 60,
    right: Spacing.three,
    padding: Spacing.two,
  },
  skipText: { fontSize: 14 },
});
