import { Pressable, StyleSheet, Text, Animated } from 'react-native';
import { useRef } from 'react';
import { useTheme } from '../hooks/use-theme';
import { Spacing } from '../constants/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'default';
  emoji?: string;
};

export function WaterButton({ label, onPress, variant = 'default', emoji }: Props) {
  const colors = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  function onPressIn() {
    Animated.spring(scale, { toValue: 0.93, useNativeDriver: true, speed: 30 }).start();
  }
  function onPressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  }

  const isPrimary = variant === 'primary';

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={{ flex: 1 }}>
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: isPrimary ? '#007AFF' : colors.backgroundElement,
            transform: [{ scale }],
          },
        ]}
      >
        {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
        <Text style={[styles.label, { color: isPrimary ? '#fff' : colors.text }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: 14,
    marginHorizontal: Spacing.one,
    gap: 4,
  },
  emoji: {
    fontSize: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
});
