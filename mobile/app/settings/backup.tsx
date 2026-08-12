import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Network from 'expo-network';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { getBackupLog } from '../../src/db/queries';
import { getBackupConfig, isBackupConfigured } from '../../src/utils/cloudBackup';
import { performCloudBackup } from '../../src/utils/performBackup';
import { formatRelativeTime } from '../../src/utils/format';
import { colors, spacing, typography, radius } from '../../src/theme';

export default function BackupScreen() {
  const [lastBackup, setLastBackup] = useState<{ last_backup_at?: string; status?: string; message?: string } | null>(null);
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();

  const load = useCallback(async () => {
    const [log, network, config] = await Promise.all([
      getBackupLog(),
      Network.getNetworkStateAsync(),
      getBackupConfig(),
    ]);
    setLastBackup(log as typeof lastBackup);
    setIsOnline(!!network.isConnected);
    setConfigured(isBackupConfigured(config));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleBackup = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Connect to the internet to back up.');
      return;
    }
    setLoading(true);
    try {
      const result = await performCloudBackup();
      if (result.mode === 'cloud') {
        Alert.alert('Success', 'Backup uploaded to MongoDB Atlas.');
      } else {
        Alert.alert(
          'Exported Locally',
          'Data is ready but cloud is not configured. Tap "Configure API" to add your MongoDB Atlas credentials.',
        );
      }
      load();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Backup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.title}>Cloud Backup</Text>
        <Text style={styles.body}>
          Backs up structured data only: clients, projects, invoices, milestones, and change requests.
        </Text>
        <Text style={styles.warning}>
          Documents, logos, and generated PDFs are NOT backed up and remain on this device.
        </Text>
      </Card>

      <TouchableOpacity style={styles.configRow} onPress={() => router.push('/settings/backup-config')}>
        <MaterialIcons name="settings" size={22} color={colors.primary} />
        <View style={styles.configBody}>
          <Text style={styles.configTitle}>Configure API</Text>
          <Text style={styles.configSub}>
            {configured ? 'MongoDB Atlas connected' : 'Not configured — tap to set up'}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={colors.outline} />
      </TouchableOpacity>

      <View style={styles.status}>
        <Text style={styles.statusLabel}>Network</Text>
        <Text style={[styles.statusValue, { color: isOnline ? colors.success : colors.error }]}>
          {isOnline ? 'Online' : 'Offline'}
        </Text>
      </View>

      <View style={styles.status}>
        <Text style={styles.statusLabel}>Cloud Status</Text>
        <Text style={[styles.statusValue, { color: configured ? colors.success : colors.warning }]}>
          {configured ? 'Configured' : 'Not configured'}
        </Text>
      </View>

      <View style={styles.status}>
        <Text style={styles.statusLabel}>Last Backup</Text>
        <Text style={styles.statusValue}>
          {lastBackup?.last_backup_at ? formatRelativeTime(lastBackup.last_backup_at) : 'Never'}
        </Text>
      </View>

      {lastBackup?.message ? <Text style={styles.message}>{lastBackup.message}</Text> : null}

      <Button
        title="Backup Now"
        onPress={handleBackup}
        loading={loading}
        disabled={!isOnline}
        style={styles.button}
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
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: spacing.md,
    marginVertical: spacing.md,
  },
  configBody: { flex: 1 },
  configTitle: { ...typography.body, fontWeight: '600', color: colors.onSurface },
  configSub: { ...typography.caption, color: colors.onSurfaceVariant },
  status: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant + '40' },
  statusLabel: { ...typography.body, color: colors.onSurfaceVariant },
  statusValue: { ...typography.body, fontWeight: '600', color: colors.onSurface },
  message: { ...typography.caption, color: colors.onSurfaceVariant, marginTop: spacing.md },
  button: { marginTop: spacing.xl },
});
