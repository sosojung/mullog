import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../hooks/use-theme';
import { Spacing } from '../constants/theme';

type Props = {
  percent: number; // 0~100
  current: number;
  goal: number;
};

export function ProgressBar({ percent, current, goal }: Props) {
  const colors = useTheme();
  const isGoalMet = percent >= 100;

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: colors.backgroundElement }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.min(percent, 100)}%`,
              backgroundColor: isGoalMet ? '#34C759' : '#007AFF',
            },
          ]}
        />
      </View>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {current}ml / {goal}ml ({percent}%)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Spacing.two,
  },
  track: {
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    textAlign: 'center',
  },
});
