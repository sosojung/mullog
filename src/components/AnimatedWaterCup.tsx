import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { formatMl } from '../utils/calculateProgress';
import Svg, { Path, Defs, ClipPath, G, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  useDerivedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/use-theme';
import { Spacing } from '../constants/theme';
import { AppColors } from '../constants/colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CUP_WIDTH = 160;
const CUP_HEIGHT = 200;
const WAVE_AMP = 6;

const PARTICLE_COUNT = 7;
const PARTICLE_ANGLES = [-60, -35, -10, 15, 40, 65, 90];
const PARTICLE_COLORS = ['#007AFF', '#34C759', '#5AC8FA', '#4CD964', '#007AFF', '#34C759', '#5AC8FA'];

function buildWavePath(offset: number, yPos: number, width: number, height: number): string {
  const w = width;
  const shift = (offset - 0.5) * w * 0.6;

  let d = `M 0 ${yPos + Math.sin(shift / w * Math.PI * 2) * WAVE_AMP}`;
  const segments = 8;
  for (let i = 1; i <= segments; i++) {
    const x = (w / segments) * i;
    const phase = (x + shift) / w * Math.PI * 2;
    const y = yPos + Math.sin(phase) * WAVE_AMP;
    d += ` L ${x} ${y}`;
  }
  d += ` L ${w} ${height} L 0 ${height} Z`;
  return d;
}

type Props = {
  percent: number;
  current: number;
  goal: number;
};

export function AnimatedWaterCup({ percent, current, goal }: Props) {
  const colors = useTheme();
  const prevGoalMet = useRef(false);

  // 색상: React state로 관리 (웹/네이티브 모두 동작)
  const [waterColor, setWaterColor] = useState(AppColors.primary);
  const [bgColor, setBgColor] = useState(AppColors.waterBg);

  // 파티클 sharedValues
  const particleY = Array.from({ length: PARTICLE_COUNT }, () => useSharedValue(0));
  const particleOpacity = Array.from({ length: PARTICLE_COUNT }, () => useSharedValue(0));
  const particleX = Array.from({ length: PARTICLE_COUNT }, () => useSharedValue(0));

  const waterLevel = useSharedValue(0);
  const waveOffset = useSharedValue(0);

  function triggerParticles() {
    PARTICLE_ANGLES.forEach((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      const targetX = Math.sin(rad) * 55;
      const targetY = -Math.cos(rad) * 55;

      particleX[i].value = CUP_WIDTH / 2;
      particleY[i].value = 10;
      particleOpacity[i].value = 1;

      particleX[i].value = withTiming(CUP_WIDTH / 2 + targetX, { duration: 600, easing: Easing.out(Easing.cubic) });
      particleY[i].value = withSequence(
        withTiming(10 + targetY, { duration: 500, easing: Easing.out(Easing.cubic) }),
        withTiming(10 + targetY + 20, { duration: 300, easing: Easing.in(Easing.cubic) })
      );
      particleOpacity[i].value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 600 })
      );
    });
  }

  useEffect(() => {
    const targetLevel = Math.min(percent, 100) / 100;
    waterLevel.value = withTiming(targetLevel, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });

    const goalMet = percent >= 100;

    // 색상 전환
    if (goalMet) {
      setWaterColor(AppColors.success);
      setBgColor(AppColors.successBg);
    } else {
      setWaterColor(AppColors.primary);
      setBgColor(AppColors.waterBg);
    }

    // 처음 달성하는 순간에만 이펙트 실행
    if (goalMet && !prevGoalMet.current) {
      triggerParticles();
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
    prevGoalMet.current = goalMet;
  }, [percent]);

  useEffect(() => {
    waveOffset.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  const waterY = useDerivedValue(() =>
    CUP_HEIGHT + WAVE_AMP * 2 - waterLevel.value * (CUP_HEIGHT + WAVE_AMP * 2)
  );

  const animatedWaterProps = useAnimatedProps(() => {
    const d = buildWavePath(waveOffset.value, waterY.value, CUP_WIDTH, CUP_HEIGHT);
    return { d };
  });

  const cupPath = `
    M 10 0
    L ${CUP_WIDTH - 10} 0
    L ${CUP_WIDTH - 20} ${CUP_HEIGHT}
    Q ${CUP_WIDTH / 2} ${CUP_HEIGHT + 12} 20 ${CUP_HEIGHT}
    Z
  `;

  const SVG_HEIGHT = CUP_HEIGHT + 80; // 파티클이 위로 올라갈 공간
  const CUP_Y_OFFSET = 70;           // 파티클 공간만큼 컵을 아래로

  const clipId = 'cupClip';

  return (
    <View style={styles.container}>
      <Svg width={CUP_WIDTH} height={SVG_HEIGHT}>
        <Defs>
          <ClipPath id={clipId}>
            <Path
              d={cupPath}
              transform={`translate(0, ${CUP_Y_OFFSET})`}
            />
          </ClipPath>
        </Defs>

        {/* 파티클 */}
        {particleY.map((py, i) => {
          const animatedCircleProps = useAnimatedProps(() => ({
            cy: py.value + CUP_Y_OFFSET,
            cx: particleX[i].value,
            opacity: particleOpacity[i].value,
          }));
          return (
            <AnimatedCircle
              key={i}
              r={4}
              fill={PARTICLE_COLORS[i]}
              animatedProps={animatedCircleProps}
            />
          );
        })}

        {/* 컵 내부 배경 */}
        <Path
          d={cupPath}
          fill={bgColor}
          transform={`translate(0, ${CUP_Y_OFFSET})`}
        />

        {/* 물 wave */}
        <G clipPath={`url(#${clipId})`}>
          <AnimatedPath
            animatedProps={animatedWaterProps}
            fill={waterColor}
            transform={`translate(0, ${CUP_Y_OFFSET})`}
          />
        </G>

        {/* 컵 테두리 */}
        <Path
          d={cupPath}
          fill="none"
          stroke={colors.backgroundElement}
          strokeWidth={3}
          transform={`translate(0, ${CUP_Y_OFFSET})`}
        />
      </Svg>

      <Text style={[styles.amount, { color: colors.text }]}>
        {formatMl(current)}<Text style={[styles.unit, { color: colors.textSecondary }]}>ml</Text>
      </Text>
      <Text style={[styles.goal, { color: colors.textSecondary }]}>
        목표 {formatMl(goal)}ml · {percent}%
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
  },
  unit: {
    fontSize: 20,
    fontWeight: '400',
  },
  goal: {
    fontSize: 14,
  },
});
