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
import { SummaryCard } from '../../src/components/SummaryCard';
import { AppLogo } from '../../src/components/ui/AppLogo';
import { Button } from '../../src/components/ui/Button';
import { ScreenLayout } from '../../src/components/ui/ScreenLayout';
import { getDashboardStats, getRecentActivity, getBackupLog } from '../../src/db/queries';
import { getCompany } from '../../src/db/queries';
import { exportEverythingToFile } from '../../src/utils/localBackup';
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
    setBackingUp(true);
    try {
      const result = await exportEverythingToFile();
      Alert.alert(
        'Export ready',
        `Backup ID:\n${result.backupId}\n\nApp version: ${result.appVersion}`,
      );
      await load();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Export failed. Please try again.');
    } finally {
      setBackingUp(false);
    }
  };

  const valuation = stats?.totalValuation ?? 0;
  const received = stats?.totalReceived ?? 0;
  const remaining = stats?.amountRemaining ?? 0;
  const collectionRate = stats?.collectionRate ?? 0;
  const receivedPct = valuation > 0 ? Math.min(100, (received / valuation) * 100) : 0;

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
      <Text style={styles.subtitle}>Business analytics at a glance.</Text>

      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsTitle}>Portfolio Valuation</Text>
        <Text style={styles.analyticsHero}>{formatCurrency(valuation, currency)}</Text>
        <Text style={styles.analyticsSub}>
          Across {stats?.totalProjects ?? 0} project{(stats?.totalProjects ?? 0) === 1 ? '' : 's'}
        </Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${receivedPct}%` }]} />
        </View>
        <Text style={styles.progressLabel}>
          {collectionRate.toFixed(0)}% collected
        </Text>

        <View style={styles.moneyRow}>
          <View style={styles.moneyCol}>
            <Text style={styles.moneyLabel}>Received</Text>
            <Text style={[styles.moneyValue, { color: colors.success }]}>
              {formatCurrency(received, currency)}
            </Text>
          </View>
          <View style={styles.moneyDivider} />
          <View style={styles.moneyCol}>
            <Text style={styles.moneyLabel}>Remaining</Text>
            <Text style={[styles.moneyValue, { color: colors.warning }]}>
              {formatCurrency(remaining, currency)}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.grid}>
        <SummaryCard label="Total Clients" value={String(stats?.totalClients ?? 0)} icon="group" />
        <SummaryCard label="Active Projects" value={String(stats?.activeProjects ?? 0)} icon="assignment" />
        <SummaryCard label="Invoiced" value={formatCurrency(stats?.totalInvoiced ?? 0, currency)} icon="receipt-long" />
        <SummaryCard label="Invoice Pending" value={formatCurrency(stats?.totalPending ?? 0, currency)} icon="account-balance-wallet" />
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
        <Button title="Export Everything" onPress={handleBackup} loading={backingUp} />
        <Text style={styles.backupNote}>
          {lastBackup ? `Last export/restore: ${formatRelativeTime(lastBackup)}` : 'No export yet'}
        </Text>
        <Text style={styles.backupWarning}>
          Documents and files are not included in the JSON export.
        </Text>
        <TouchableOpacity onPress={() => router.push('/settings/backup')}>
          <Text style={styles.backupLink}>Export & Restore</Text>
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
  analyticsCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: spacing.container,
    marginBottom: spacing.lg,
  },
  analyticsTitle: {
    ...typography.label,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  analyticsHero: {
    ...typography.display,
    fontSize: 30,
    color: colors.primary,
  },
  analyticsSub: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceContainer,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 999,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  moneyRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  moneyCol: { flex: 1 },
  moneyDivider: {
    width: 1,
    backgroundColor: colors.outlineVariant + '60',
    marginHorizontal: spacing.md,
  },
  moneyLabel: { ...typography.caption, color: colors.onSurfaceVariant },
  moneyValue: { ...typography.title, fontSize: 18, marginTop: 2 },
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
