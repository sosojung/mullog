import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, ClipPath, Rect, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  Easing,
  useDerivedValue,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/use-theme';
import { Spacing } from '../constants/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const CUP_WIDTH = 160;
const CUP_HEIGHT = 200;
const WAVE_AMP = 6;

function buildWavePath(offset: number, yPos: number, width: number, height: number): string {
  const w = width;
  const step = w / 2;
  const x0 = -w + offset * w * 2;

  let d = `M ${x0} ${yPos}`;
  for (let x = x0; x < w * 2; x += step) {
    const cp1x = x + step / 4;
    const cp1y = yPos - WAVE_AMP;
    const cp2x = x + (step * 3) / 4;
    const cp2y = yPos + WAVE_AMP;
    const ex = x + step;
    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${ex} ${yPos}`;
  }
  d += ` L ${w * 2} ${height} L ${x0} ${height} Z`;
  return d;
}

type Props = {
  percent: number;
  current: number;
  goal: number;
};

export function AnimatedWaterCup({ percent, current, goal }: Props) {
  const colors = useTheme();

  const waterLevel = useSharedValue(0);
  const waveOffset = useSharedValue(0);
  const colorProgress = useSharedValue(0);

  useEffect(() => {
    const targetLevel = Math.min(percent, 100) / 100;
    waterLevel.value = withTiming(targetLevel, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
    colorProgress.value = withTiming(percent >= 100 ? 1 : 0, { duration: 600 });
  }, [percent]);

  useEffect(() => {
    waveOffset.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  // 0%일 때 물이 컵 아래로 완전히 숨도록 여유 추가
  const waterY = useDerivedValue(() =>
    CUP_HEIGHT + WAVE_AMP * 2 - waterLevel.value * (CUP_HEIGHT + WAVE_AMP * 2)
  );

  const animatedWaterProps = useAnimatedProps(() => {
    const d = buildWavePath(waveOffset.value, waterY.value, CUP_WIDTH, CUP_HEIGHT);
    const fill = interpolateColor(
      colorProgress.value,
      [0, 1],
      ['#007AFF', '#34C759']
    );
    return { d, fill };
  });

  const animatedFillProps = useAnimatedProps(() => {
    const fill = interpolateColor(
      colorProgress.value,
      [0, 1],
      ['rgba(0,122,255,0.15)', 'rgba(52,199,89,0.15)']
    );
    return { fill };
  });

  // 컵 모양 path (둥근 바닥)
  const cupPath = `
    M 10 0
    L ${CUP_WIDTH - 10} 0
    L ${CUP_WIDTH - 20} ${CUP_HEIGHT}
    Q ${CUP_WIDTH / 2} ${CUP_HEIGHT + 12} 20 ${CUP_HEIGHT}
    Z
  `;

  const clipId = 'cupClip';

  return (
    <View style={styles.container}>
      <Svg width={CUP_WIDTH} height={CUP_HEIGHT + 20}>
        <Defs>
          <ClipPath id={clipId}>
            <Path d={cupPath} />
          </ClipPath>
        </Defs>

        {/* 컵 내부 배경 */}
        <AnimatedPath
          d={cupPath}
          animatedProps={animatedFillProps}
        />

        {/* 물 wave (클리핑 적용) */}
        <G clipPath={`url(#${clipId})`}>
          <AnimatedPath animatedProps={animatedWaterProps} />
        </G>

        {/* 컵 테두리 */}
        <Path
          d={cupPath}
          fill="none"
          stroke={colors.backgroundElement}
          strokeWidth={3}
        />
      </Svg>

      {/* 수치 표시 */}
      <Text style={[styles.amount, { color: colors.text }]}>
        {current}<Text style={[styles.unit, { color: colors.textSecondary }]}>ml</Text>
      </Text>
      <Text style={[styles.goal, { color: colors.textSecondary }]}>
        목표 {goal}ml · {percent}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  amount: {
    fontSize: 48,
    fontWeight: '700',
    marginTop: Spacing.two,
  },
  unit: {
    fontSize: 20,
    fontWeight: '400',
  },
  goal: {
    fontSize: 14,
  },
});
