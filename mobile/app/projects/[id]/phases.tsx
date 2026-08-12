import { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { getPhases, savePhase, togglePhaseComplete, deletePhase, reorderPhases } from '../../../src/db/queries';
import type { ProjectPhase } from '../../../src/types';
import { ListScreenLayout } from '../../../src/components/ui/ScreenLayout';
import { InvalidProjectFallback } from '../../../src/components/ui/InvalidProjectFallback';
import { useProjectId } from '../../../src/hooks/useProjectId';
import { colors, spacing, typography, radius } from '../../../src/theme';

export default function ProjectPhasesScreen() {
  const projectId = useProjectId();
  const router = useRouter();
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      setPhases(await getPhases(projectId));
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to load phases');
    }
  }, [projectId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const addPhase = async () => {
    if (!projectId) {
      Alert.alert('Error', 'Project not found');
      return;
    }
    if (!newTitle.trim()) {
      Alert.alert('Required', 'Enter a phase name');
      return;
    }
    setSaving(true);
    try {
      await savePhase({ project_id: projectId, title: newTitle.trim(), sort_order: phases.length });
      setNewTitle('');
      await load();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to add phase');
    } finally {
      setSaving(false);
    }
  };

  const toggleComplete = async (phase: ProjectPhase) => {
    if (!projectId) return;
    try {
      await togglePhaseComplete(phase.id, projectId, phase.title, !phase.is_completed);
      await load();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to update phase');
    }
  };

  const removePhase = (phase: ProjectPhase) => {
    Alert.alert('Delete Phase', `Remove "${phase.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePhase(phase.id);
            await load();
          } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Failed to delete phase');
          }
        },
      },
    ]);
  };

  const openPhase = (phase: ProjectPhase) => {
    try {
      router.push(`/phase/${phase.id}`);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not open phase');
    }
  };

  const movePhase = async (index: number, direction: -1 | 1) => {
    if (!projectId) return;
    const target = index + direction;
    if (target < 0 || target >= phases.length) return;
    const next = [...phases];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setPhases(next);
    try {
      await reorderPhases(projectId, next.map((p) => p.id));
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to reorder');
      await load();
    }
  };

  if (!projectId) return <InvalidProjectFallback />;

  return (
    <ListScreenLayout
      fixedTop={
        <View style={styles.topSection}>
          <View style={styles.addRow}>
            <TextInput
              style={styles.input}
              placeholder="New phase name..."
              placeholderTextColor={colors.outline}
              value={newTitle}
              onChangeText={setNewTitle}
              onSubmitEditing={addPhase}
              editable={!saving}
            />
            <TouchableOpacity style={styles.addBtn} onPress={addPhase} disabled={saving}>
              <MaterialIcons name="add" size={24} color={colors.onPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>Tap a phase to edit. Use arrows to reorder.</Text>
        </View>
      }
    >
      <FlatList
        data={phases}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Text style={styles.empty}>No phases yet. Add your first phase above.</Text>}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <View style={styles.reorder}>
              <TouchableOpacity onPress={() => movePhase(index, -1)} disabled={index === 0} hitSlop={8}>
                <MaterialIcons name="keyboard-arrow-up" size={22} color={index === 0 ? colors.outlineVariant : colors.outline} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => movePhase(index, 1)} disabled={index === phases.length - 1} hitSlop={8}>
                <MaterialIcons name="keyboard-arrow-down" size={22} color={index === phases.length - 1 ? colors.outlineVariant : colors.outline} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => toggleComplete(item)} style={styles.check}>
              <MaterialIcons
                name={item.is_completed ? 'check-circle' : 'radio-button-unchecked'}
                size={24}
                color={item.is_completed ? colors.success : colors.outline}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.rowBody} onPress={() => openPhase(item)} activeOpacity={0.7}>
              <Text style={[styles.title, !!item.is_completed && styles.titleDone]}>
                {index + 1}. {item.title}
              </Text>
              {item.status ? (
                <Text style={styles.meta}>{String(item.status).replace('_', ' ')}</Text>
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removePhase(item)} hitSlop={8}>
              <MaterialIcons name="delete-outline" size={22} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
      />
    </ListScreenLayout>
  );
}

const styles = StyleSheet.create({
  topSection: { borderBottomWidth: 1, borderBottomColor: colors.outlineVariant + '40' },
  addRow: { flexDirection: 'row', padding: spacing.container, gap: spacing.sm },
  hint: { ...typography.caption, color: colors.onSurfaceVariant, paddingHorizontal: spacing.container, paddingBottom: spacing.sm },
  input: {
    flex: 1,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLowest,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingHorizontal: spacing.container, paddingBottom: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  reorder: { marginRight: spacing.xs },
  check: { marginRight: spacing.sm },
  rowBody: { flex: 1, paddingVertical: 4 },
  title: { ...typography.body, color: colors.onSurface },
  titleDone: { textDecorationLine: 'line-through', color: colors.onSurfaceVariant },
  meta: { ...typography.caption, color: colors.onSurfaceVariant, marginTop: 2, textTransform: 'capitalize' },
  empty: { ...typography.bodySm, color: colors.onSurfaceVariant, textAlign: 'center', padding: spacing.lg },
});
