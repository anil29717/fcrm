import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { colors, spacing } from '../../theme';

interface HeaderBackButtonProps {
  /** Where to go when there is no history (e.g. deep link) */
  fallback?: Href;
  onPress?: () => void;
  color?: string;
}

export function HeaderBackButton({
  fallback = '/(tabs)' as Href,
  onPress,
  color = colors.primary,
}: HeaderBackButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallback);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.button}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <MaterialIcons name="arrow-back" size={24} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginLeft: spacing.sm,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
