import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Network from 'expo-network';
import { SummaryCard } from '../../src/components/SummaryCard';
import { AppLogo } from '../../src/components/ui/AppLogo';
import { Button } from '../../src/components/ui/Button';
import { ScreenLayout } from '../../src/components/ui/ScreenLayout';
import { getDashboardStats, getRecentActivity, getBackupLog } from '../../src/db/queries';
import { getCompany } from '../../src/db/queries';
import { performCloudBackup } from '../../src/utils/performBackup';
import { getBackupConfig, isBackupConfigured } from '../../src/utils/cloudBackup';
import type { ActivityItem, DashboardStats } from '../../src/types';
import { formatCurrency, formatRelativeTime } from '../../src/utils/format';
import { colors, spacing, typography, radius } from '../../src/theme';

const ACTIVITY_ICONS: Record<ActivityItem['type'], keyof typeof MaterialIcons.glyphMap> = {
  invoice: 'receipt',
  phase: 'play-arrow',
  client: 'person-add',
  project: 'folder',
};

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [currency, setCurrency] = useState('INR');
  const [refreshing, setRefreshing] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const router = useRouter();

  const load = useCallback(async () => {
    const [s, a, b, company] = await Promise.all([
      getDashboardStats(),
      getRecentActivity(),
      getBackupLog(),
      getCompany(),
    ]);
    setStats(s);
    setActivity(a);
    setLastBackup((b as { last_backup_at?: string })?.last_backup_at ?? null);
    setCurrency(company?.currency ?? 'INR');
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleBackup = async () => {
    const state = await Network.getNetworkStateAsync();
    if (!state.isConnected) {
      Alert.alert('Offline', 'Internet connection required for backup.');
      return;
    }
    setBackingUp(true);
    try {
      const config = await getBackupConfig();
      const result = await performCloudBackup();
      if (result.mode === 'cloud') {
        Alert.alert('Success', 'Backup uploaded to MongoDB Atlas.');
      } else if (!isBackupConfigured(config)) {
        Alert.alert(
          'Not Configured',
          'Cloud backup is not set up. Go to Settings → Backup → Configure API.',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Configure', onPress: () => router.push('/settings/backup-config') },
          ],
        );
      } else {
        Alert.alert('Success', 'Backup completed.');
      }
      await load();
    } catch (e) {
      const { saveBackupLog } = await import('../../src/db/queries');
      await saveBackupLog('failed', e instanceof Error ? e.message : 'Backup failed');
      Alert.alert('Error', e instanceof Error ? e.message : 'Backup failed. Please try again.');
    } finally {
      setBackingUp(false);
    }
  };

  return (
    <ScreenLayout
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <View style={styles.hero}>
        <AppLogo size="md" />
        <View style={styles.heroText}>
          <Text style={styles.brand}>FreelancePro</Text>
          <Text style={styles.greeting}>Welcome back</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>Here's a summary of your business today.</Text>

      <View style={styles.grid}>
        <SummaryCard label="Total Clients" value={String(stats?.totalClients ?? 0)} icon="group" />
        <SummaryCard label="Active Projects" value={String(stats?.activeProjects ?? 0)} icon="assignment" />
        <SummaryCard label="Received" value={formatCurrency(stats?.totalReceived ?? 0, currency)} icon="payments" />
        <SummaryCard label="Pending" value={formatCurrency(stats?.totalPending ?? 0, currency)} icon="account-balance-wallet" />
      </View>

      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.activityCard}>
        {activity.length === 0 ? (
          <Text style={styles.emptyActivity}>No recent activity</Text>
        ) : (
          activity.map((item) => (
            <View key={item.id} style={styles.activityRow}>
              <View style={styles.activityIcon}>
                <MaterialIcons name={ACTIVITY_ICONS[item.type]} size={20} color={colors.primaryContainer} />
              </View>
              <View style={styles.activityText}>
                <Text style={styles.activityDesc}>{item.description}</Text>
                <Text style={styles.activityTime}>{formatRelativeTime(item.created_at)}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.backupSection}>
        <Button title="Backup Now" onPress={handleBackup} loading={backingUp} />
        <Text style={styles.backupNote}>
          {lastBackup ? `Last backup: ${formatRelativeTime(lastBackup)}` : 'No backup yet'}
        </Text>
        <Text style={styles.backupWarning}>
          Documents and files are not included in backup.
        </Text>
        <TouchableOpacity onPress={() => router.push('/settings/backup')}>
          <Text style={styles.backupLink}>View backup details</Text>
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  heroText: { flex: 1 },
  brand: {
    ...typography.label,
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  greeting: { ...typography.display, fontSize: 28, color: colors.onSurface },
  subtitle: { ...typography.bodySm, color: colors.onSurfaceVariant, marginBottom: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.lg },
  sectionTitle: { ...typography.title, color: colors.onSurface, marginBottom: spacing.md },
  activityCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant + '40',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryContainer + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  activityText: { flex: 1 },
  activityDesc: { ...typography.bodySm, color: colors.onSurface, fontWeight: '500' },
  activityTime: { ...typography.caption, color: colors.onSurfaceVariant, marginTop: 2 },
  emptyActivity: { ...typography.bodySm, color: colors.onSurfaceVariant, padding: spacing.lg, textAlign: 'center' },
  backupSection: { alignItems: 'center', paddingVertical: spacing.lg },
  backupNote: { ...typography.caption, color: colors.onSurfaceVariant, marginTop: spacing.sm },
  backupWarning: { ...typography.caption, color: colors.warning, marginTop: spacing.xs, textAlign: 'center' },
  backupLink: { ...typography.bodySm, color: colors.primary, marginTop: spacing.sm },
});
