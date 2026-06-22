import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../hooks/use-theme';
import { Spacing } from '../constants/theme';

type Props = {
  label: string;
  onPress: () => void;
};

export function WaterButton({ label, onPress }: Props) {
  const colors = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.backgroundElement, opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: 12,
    marginHorizontal: Spacing.one,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
