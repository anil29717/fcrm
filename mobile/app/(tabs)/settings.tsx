import { View, Text, TouchableOpacity, Switch, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { ScreenLayout } from '../../src/components/ui/ScreenLayout';
import { getAppVersion } from '../../src/utils/localBackup';
import { colors, spacing, typography, radius } from '../../src/theme';

interface SettingRowProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
}

function SettingRow({ icon, title, subtitle, onPress, right }: SettingRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={styles.rowIcon}>
        <MaterialIcons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {right ?? (onPress ? <MaterialIcons name="chevron-right" size={22} color={colors.outline} /> : null)}
    </TouchableOpacity>
  );
}

function SettingGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.groupCard}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const { lock, biometricAvailable, biometricEnabled, toggleBiometric } = useAuth();
  const router = useRouter();
  const appVersion = getAppVersion();

  const handleLogout = () => {
    Alert.alert('Lock App', 'Lock the app and require PIN to re-enter?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Lock', onPress: () => { lock(); router.replace('/auth/enter-pin'); } },
    ]);
  };

  return (
    <ScreenLayout>
      <Text style={styles.subheading}>Manage your business preferences and security.</Text>

      <SettingGroup title="Account">
        <SettingRow
          icon="storefront"
          title="Business Profile"
          subtitle="Edit company details & tax info"
          onPress={() => router.push('/settings/business-profile')}
        />
      </SettingGroup>

      <SettingGroup title="Security">
        <SettingRow
          icon="lock"
          title="Change PIN"
          subtitle="Update your app access code"
          onPress={() => router.push('/settings/change-pin')}
        />
        {biometricAvailable ? (
          <SettingRow
            icon="fingerprint"
            title="Biometric Login"
            subtitle="Enable Face ID / Touch ID"
            right={
              <Switch
                value={biometricEnabled}
                onValueChange={toggleBiometric}
                trackColor={{ true: colors.primaryContainer }}
              />
            }
          />
        ) : null}
      </SettingGroup>

      <SettingGroup title="System">
        <SettingRow
          icon="import-export"
          title="Export & Restore"
          subtitle="Export everything or restore from a backup file"
          onPress={() => router.push('/settings/backup')}
        />
        <SettingRow
          icon="receipt"
          title="Invoice Template"
          subtitle="Customize invoice layout"
          onPress={() => router.push('/settings/template-builder')}
        />
        <SettingRow
          icon="tag"
          title="Invoice Numbering"
          subtitle="Prefix, format, and sequence"
          onPress={() => router.push('/settings/invoice-numbering')}
        />
        <SettingRow icon="info" title="About" subtitle={`Version ${appVersion}`} />
      </SettingGroup>

      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>Lock App</Text>
      </TouchableOpacity>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  subheading: { ...typography.bodySm, color: colors.onSurfaceVariant, marginBottom: spacing.lg },
  group: { marginBottom: spacing.md },
  groupTitle: { ...typography.title, fontSize: 16, color: colors.primary, marginBottom: spacing.sm },
  groupCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant + '30',
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rowBody: { flex: 1 },
  rowTitle: { ...typography.body, fontWeight: '500', color: colors.onSurface },
  rowSubtitle: { ...typography.caption, color: colors.onSurfaceVariant },
  logout: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: 'center',
  },
  logoutText: { ...typography.label, color: colors.error },
});
