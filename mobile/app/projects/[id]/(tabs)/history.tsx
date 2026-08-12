import { useCallback, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { getProjectHistory, addManualHistoryNote, getProject } from '../../../../src/db/queries';
import type { ProjectHistory } from '../../../../src/types';
import { ScreenLayout } from '../../../../src/components/ui/ScreenLayout';
import { InvalidProjectFallback } from '../../../../src/components/ui/InvalidProjectFallback';
import { useProjectId } from '../../../../src/hooks/useProjectId';
import { formatDate } from '../../../../src/utils/format';
import { colors, spacing, typography, radius } from '../../../../src/theme';

const EVENT_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  created: 'add-circle',
  phase: 'timeline',
  document: 'folder',
  status: 'swap-horiz',
  env: 'vpn-key',
  change_request: 'edit',
  note: 'sticky-note-2',
  payment: 'payments',
  version: 'history',
};

export default function ProjectHistoryScreen() {
  const projectId = useProjectId();
  const [history, setHistory] = useState<ProjectHistory[]>([]);
  const [version, setVersion] = useState(1);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    if (!projectId) return;
    const [rows, project] = await Promise.all([
      getProjectHistory(projectId),
      getProject(projectId),
    ]);
    setHistory(rows);
    setVersion((project as { version?: number } | null)?.version ?? 1);
  }, [projectId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const addNote = async () => {
    if (!projectId || !note.trim()) return;
    await addManualHistoryNote(projectId, note.trim());
    setNote('');
    load();
  };

  if (!projectId) return <InvalidProjectFallback />;

  return (
    <ScreenLayout scrollable={false}>
      <View style={styles.versionBanner}>
        <MaterialIcons name="verified" size={18} color={colors.primary} />
        <Text style={styles.versionText}>Current version v{version}</Text>
        <Text style={styles.versionCount}>{history.length} events</Text>
      </View>
      <View style={styles.noteBox}>
        <TextInput
          style={styles.noteInput}
          placeholder="Add a manual note to timeline..."
          placeholderTextColor={colors.outline}
          value={note}
          onChangeText={setNote}
          multiline
        />
        <TouchableOpacity style={styles.noteBtn} onPress={addNote}>
          <MaterialIcons name="add-comment" size={20} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={history}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        style={styles.listScroll}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Text style={styles.empty}>No history yet. Changes will appear here automatically.</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.iconCol}>
              <View style={styles.iconBubble}>
                <MaterialIcons name={EVENT_ICONS[item.event_type] ?? 'history'} size={18} color={colors.primary} />
              </View>
              <View style={styles.line} />
            </View>
            <View style={styles.body}>
              <Text style={styles.type}>{item.event_type.replace('_', ' ')}</Text>
              <Text style={styles.desc}>{item.description}</Text>
              {item.old_value && item.new_value ? (
                <Text style={styles.change}>{item.old_value} → {item.new_value}</Text>
              ) : null}
              {item.note ? <Text style={styles.noteText}>{item.note}</Text> : null}
              <Text style={styles.time}>{formatDate(item.created_at)}</Text>
            </View>
          </View>
        )}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  versionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary + '12',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  versionText: { ...typography.bodySm, color: colors.primary, fontWeight: '600', flex: 1 },
  versionCount: { ...typography.caption, color: colors.onSurfaceVariant },
  noteBox: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  noteInput: {
    flex: 1,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLow,
    minHeight: 44,
  },
  noteBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listScroll: { flex: 1 },
  list: { paddingBottom: spacing.xl },
  item: { flexDirection: 'row', marginBottom: spacing.md },
  iconCol: { alignItems: 'center', marginRight: spacing.md, width: 32 },
  iconBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryContainer + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: { flex: 1, width: 2, backgroundColor: colors.outlineVariant + '60', marginTop: 4 },
  body: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  type: { ...typography.caption, color: colors.primary, textTransform: 'uppercase', marginBottom: 2 },
  desc: { ...typography.body, color: colors.onSurface },
  change: { ...typography.caption, color: colors.primary, marginTop: 4 },
  noteText: { ...typography.bodySm, color: colors.onSurfaceVariant, fontStyle: 'italic', marginTop: 4 },
  time: { ...typography.caption, color: colors.outline, marginTop: spacing.xs },
  empty: { ...typography.bodySm, color: colors.onSurfaceVariant, textAlign: 'center', padding: spacing.lg },
});
