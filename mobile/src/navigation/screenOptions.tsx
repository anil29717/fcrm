import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { HeaderBackButton } from '../components/ui/HeaderBackButton';
import { colors } from '../theme';

export const stackScreenOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.primary,
  headerTitleStyle: { fontWeight: '600', color: colors.onSurface },
  headerShadowVisible: false,
  headerBackVisible: false,
  headerLeft: () => <HeaderBackButton />,
  gestureEnabled: true,
  animation: 'slide_from_right',
  contentStyle: { backgroundColor: colors.background },
};

export function stackScreen(title: string, extra?: NativeStackNavigationOptions): NativeStackNavigationOptions {
  return { ...stackScreenOptions, title, ...extra };
}

export function stackScreenNoBack(title: string, extra?: NativeStackNavigationOptions): NativeStackNavigationOptions {
  return {
    ...stackScreenOptions,
    title,
    headerLeft: () => null,
    gestureEnabled: false,
    ...extra,
  };
}
