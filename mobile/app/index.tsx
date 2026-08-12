import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AppLogo } from '../src/components/ui/AppLogo';
import { useAuth } from '../src/context/AuthContext';
import { colors, spacing } from '../src/theme';

export default function Index() {
  const { state, isOnboarded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (state === 'loading') return;
    if (state === 'no_pin') {
      router.replace('/auth/create-pin');
      return;
    }
    if (state === 'locked') {
      router.replace('/auth/enter-pin');
      return;
    }
    if (!isOnboarded) {
      router.replace('/onboarding/company-setup');
      return;
    }
    router.replace('/(tabs)');
  }, [state, isOnboarded, router]);

  return (
    <View style={styles.container}>
      <AppLogo size="xl" style={styles.logo} />
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  logo: {
    marginBottom: spacing.lg,
  },
});
