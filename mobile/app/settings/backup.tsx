import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { getBackupLog } from '../../src/db/queries';
import {
  exportEverythingToFile,
  getAppVersion,
  restoreEverythingFromFile,
} from '../../src/utils/localBackup';
import { useAuth } from '../../src/context/AuthContext';
import { formatRelativeTime } from '../../src/utils/format';
import { colors, spacing, typography } from '../../src/theme';

export default function BackupScreen() {
  const [lastBackup, setLastBackup] = useState<{ last_backup_at?: string; status?: string; message?: string } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const { refreshOnboarding } = useAuth();
  const appVersion = getAppVersion();

  const load = useCallback(async () => {
    const log = await getBackupLog();
    setLastBackup(log as typeof lastBackup);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportEverythingToFile();
      Alert.alert(
        'Export ready',
        `Backup ID:\n${result.backupId}\n\nApp version: ${result.appVersion}\n\nShare or save this JSON file. Use Restore later to import everything.`,
      );
      load();
    } catch (e) {
      Alert.alert('Export failed', e instanceof Error ? e.message : 'Could not export backup');
    } finally {
      setExporting(false);
    }
  };

  const runRestore = async () => {
    setRestoring(true);
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
      );
      load();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not restore backup';
      if (message !== 'No backup file selected') {
        Alert.alert('Restore failed', message);
      }
    } finally {
      setRestoring(false);
    }
  };

  const handleRestore = () => {
    Alert.alert(
      'Restore from file?',
      'This replaces clients, projects, invoices, and company data on this device with the selected backup JSON. Your PIN stays the same.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Choose file', style: 'destructive', onPress: () => { void runRestore(); } },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.title}>Export & Restore</Text>
        <Text style={styles.body}>
          Export everything to a JSON file (clients, projects, invoices, phases, payments, and settings).
          Each file includes an app version and backup ID so you can identify it later.
        </Text>
        <Text style={styles.warning}>
          Documents, logos, and generated PDFs are not included in the JSON export.
        </Text>
      </Card>

      <View style={styles.status}>
        <Text style={styles.statusLabel}>App Version</Text>
        <Text style={styles.statusValue}>{appVersion}</Text>
      </View>

      <View style={styles.status}>
        <Text style={styles.statusLabel}>Last Export / Restore</Text>
        <Text style={styles.statusValue}>
          {lastBackup?.last_backup_at ? formatRelativeTime(lastBackup.last_backup_at) : 'Never'}
        </Text>
      </View>

      {lastBackup?.message ? <Text style={styles.message}>{lastBackup.message}</Text> : null}

      <Button
        title="Export Everything"
        onPress={handleExport}
        loading={exporting}
        style={styles.button}
      />
      <Button
        title="Restore from File"
        onPress={handleRestore}
        loading={restoring}
        variant="secondary"
        style={styles.restoreButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.container },
  title: { ...typography.title, color: colors.onSurface, marginBottom: spacing.sm },
  body: { ...typography.bodySm, color: colors.onSurfaceVariant, marginBottom: spacing.sm },
  warning: { ...typography.caption, color: colors.warning },
  status: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant + '40',
  },
  statusLabel: { ...typography.body, color: colors.onSurfaceVariant },
  statusValue: { ...typography.body, fontWeight: '600', color: colors.onSurface, flexShrink: 1, textAlign: 'right' },
  message: { ...typography.caption, color: colors.onSurfaceVariant, marginTop: spacing.md },
  button: { marginTop: spacing.xl },
  restoreButton: { marginTop: spacing.md },
});
