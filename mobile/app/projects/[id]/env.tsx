import { useCallback, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Dropdown } from '../../../src/components/ui/Dropdown';
import { PasswordInput } from '../../../src/components/ui/PasswordInput';
import { ENVIRONMENT_OPTIONS } from '../../../src/constants/options';
import { getEnvValues, saveEnvValue, deleteEnvValue } from '../../../src/db/queries';
import type { ProjectEnvValue } from '../../../src/types';
import { ScreenLayout } from '../../../src/components/ui/ScreenLayout';
import { InvalidProjectFallback } from '../../../src/components/ui/InvalidProjectFallback';
import { useProjectId } from '../../../src/hooks/useProjectId';
import { colors, spacing, typography, radius } from '../../../src/theme';

export default function ProjectEnvScreen() {
  const projectId = useProjectId();
  const [items, setItems] = useState<ProjectEnvValue[]>([]);
  const [keyName, setKeyName] = useState('');
  const [value, setValue] = useState('');
  const [environment, setEnvironment] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!projectId) return;
    setItems(await getEnvValues(projectId));
  }, [projectId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const add = async () => {
    if (!projectId) return;
    setSaving(true);
    try {
      await saveEnvValue({
        project_id: projectId,
        key_name: keyName,
        value,
        environment: environment || undefined,
        notes: notes || undefined,
      });
      setKeyName('');
      setValue('');
      setEnvironment('');
      setNotes('');
      await load();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!projectId) return <InvalidProjectFallback />;

  return (
    <ScreenLayout>
      <Text style={styles.formTitle}>Add Config Value</Text>
      <PasswordInput label="Key / Variable" value={keyName} onChangeText={setKeyName} placeholder="API_KEY" />
      <PasswordInput label="Value" value={value} onChangeText={setValue} placeholder="Secret value" />
      <Dropdown label="Environment" options={ENVIRONMENT_OPTIONS} value={environment || null} onChange={setEnvironment} placeholder="Optional" />
      <TextInput style={styles.notes} placeholder="Notes (optional)" placeholderTextColor={colors.outline} value={notes} onChangeText={setNotes} multiline />
      <TouchableOpacity style={styles.saveBtn} onPress={add} disabled={saving}>
        {saving ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.saveText}>Add Entry</Text>}
      </TouchableOpacity>

      <Text style={styles.listTitle}>Saved entries</Text>
      {items.length === 0 ? (
        <Text style={styles.empty}>No config values yet.</Text>
      ) : (
        items.map((item) => (
          <View key={item.id} style={styles.row}>
            <MaterialIcons name="vpn-key" size={20} color={colors.primary} />
            <View style={styles.rowBody}>
              <Text style={styles.key}>{item.key_name}</Text>
              <Text style={styles.meta}>{item.environment ?? '—'} · ••••••••</Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                Alert.alert('Delete', 'Remove this config?', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      await deleteEnvValue(item.id, projectId);
                      load();
                    },
                  },
                ])
              }
            >
              <MaterialIcons name="delete-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  formTitle: { ...typography.title, fontSize: 15, color: colors.onSurface, marginBottom: spacing.sm },
  notes: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLow,
    minHeight: 60,
    marginBottom: spacing.sm,
  },
  saveBtn: { backgroundColor: colors.primaryContainer, padding: 12, borderRadius: radius.lg, alignItems: 'center', marginBottom: spacing.lg },
  saveText: { ...typography.label, color: colors.onPrimary },
  listTitle: { ...typography.title, fontSize: 15, color: colors.onSurface, marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  rowBody: { flex: 1 },
  key: { ...typography.body, fontWeight: '600', color: colors.onSurface },
  meta: { ...typography.caption, color: colors.onSurfaceVariant },
  empty: { ...typography.bodySm, color: colors.onSurfaceVariant, textAlign: 'center', padding: spacing.lg },
});
