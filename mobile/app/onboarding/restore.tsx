import { useState } from 'react';
import { Alert, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/ui/Button';
import { ScreenLayout } from '../../src/components/ui/ScreenLayout';
import { FormSection } from '../../src/components/forms/FormSection';
import { restoreEverythingFromFile } from '../../src/utils/localBackup';
import { useAuth } from '../../src/context/AuthContext';
import { colors, spacing, typography } from '../../src/theme';

export default function RestoreScreen() {
  const [loading, setLoading] = useState(false);
  const { refreshOnboarding } = useAuth();
  const router = useRouter();

  const restore = async () => {
    setLoading(true);
    try {
      const result = await restoreEverythingFromFile();
      await refreshOnboarding();
      Alert.alert(
        'Restore complete',
        [
          result.backupId ? `Backup: ${result.backupId}` : null,
          result.appVersion ? `From app version: ${result.appVersion}` : null,
          `Imported ${result.clients} clients, ${result.projects} projects, ${result.invoices} invoices.`,
        ].filter(Boolean).join('\n'),
        [{ text: 'Continue', onPress: () => router.replace('/(tabs)') }],
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not restore backup';
      if (message !== 'No backup file selected') {
        Alert.alert('Restore failed', message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout>
      <FormSection title="Restore from backup file">
        <Text style={styles.hint}>
          Choose a FreelancePro JSON export from your old phone or cloud drive.
          The file includes an app version and backup ID so you can confirm it is the right one.
        </Text>
      </FormSection>
      <Button title="Choose Backup File" onPress={restore} loading={loading} />
      <Button
        title="Skip — set up as new business"
        onPress={() => router.replace('/onboarding/company-setup')}
        variant="ghost"
        style={styles.skip}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  hint: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  skip: { marginTop: spacing.md },
});
