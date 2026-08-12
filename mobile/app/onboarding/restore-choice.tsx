import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppLogo } from '../../src/components/ui/AppLogo';
import { colors, spacing, typography, radius } from '../../src/theme';

export default function RestoreChoiceScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.content}>
        <AppLogo size="lg" style={styles.logo} />
        <Text style={styles.title}>Set up FreelancePro</Text>
        <Text style={styles.subtitle}>
          Start fresh, or restore everything from a FreelancePro backup JSON file (includes app version ID).
        </Text>

        <TouchableOpacity
          style={styles.option}
          onPress={() => router.replace('/onboarding/restore')}
          activeOpacity={0.85}
        >
          <MaterialIcons name="folder-open" size={28} color={colors.primary} />
          <View style={styles.optionBody}>
            <Text style={styles.optionTitle}>Restore from file</Text>
            <Text style={styles.optionSub}>
              Import clients, projects, and invoices from an export backup
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={colors.outline} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => router.replace('/onboarding/company-setup')}
          activeOpacity={0.85}
        >
          <MaterialIcons name="business" size={28} color={colors.primary} />
          <View style={styles.optionBody}>
            <Text style={styles.optionTitle}>Set up as new business</Text>
            <Text style={styles.optionSub}>Create a new company profile on this device</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={colors.outline} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    paddingHorizontal: spacing.container,
    justifyContent: 'center',
  },
  logo: { alignSelf: 'center', marginBottom: spacing.xl },
  title: {
    ...typography.title,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  optionBody: { flex: 1 },
  optionTitle: { ...typography.body, fontWeight: '600', color: colors.onSurface },
  optionSub: { ...typography.caption, color: colors.onSurfaceVariant, marginTop: 2 },
});
