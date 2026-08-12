import { Platform, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

export const TAB_BAR_BASE_HEIGHT = 56;

export function useTabBarInsets() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? spacing.sm : 0);

  const tabBarStyle: ViewStyle = {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    height: TAB_BAR_BASE_HEIGHT + bottomInset,
    paddingTop: spacing.sm,
    paddingBottom: bottomInset,
  };

  return {
    insets,
    bottomInset,
    tabBarHeight: TAB_BAR_BASE_HEIGHT + bottomInset,
    tabBarStyle,
    contentPaddingBottom: spacing.md,
  };
}
