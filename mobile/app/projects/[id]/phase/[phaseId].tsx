import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Input } from '../../../../src/components/ui/Input';
import { Button } from '../../../../src/components/ui/Button';
import { Dropdown } from '../../../../src/components/ui/Dropdown';
import { DateInput } from '../../../../src/components/ui/DateInput';
import { ToggleRow } from '../../../../src/components/ui/ToggleRow';
import { ScreenLayout } from '../../../../src/components/ui/ScreenLayout';
import { PHASE_STATUS_OPTIONS } from '../../../../src/constants/options';
import { getPhase, savePhase, getPhaseTasks, savePhaseTask } from '../../../../src/db/queries';
import type { PhaseTask } from '../../../../src/types';
import { colors, spacing, typography } from '../../../../src/theme';

export default function PhaseDetailScreen() {
  const params = useLocalSearchParams<{ phaseId?: string | string[] }>();
  const rawId = Array.isArray(params.phaseId) ? params.phaseId[0] : params.phaseId;
  const id = Number(rawId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('pending');
  const [projectId, setProjectId] = useState(0);
  const [sortOrder, setSortOrder] = useState(0);
  const [tasks, setTasks] = useState<PhaseTask[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const load = useCallback(async () => {
    if (!Number.isFinite(id) || id <= 0) {
      setMissing(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const phase = await getPhase(id);
      if (!phase) {
        setMissing(true);
        setLoading(false);
        return;
      }
      setMissing(false);
      setTitle(phase.title);
      setDescription(phase.description ?? '');
      setStartDate(phase.start_date ?? '');
      setEndDate(phase.end_date ?? '');
      setStatus(phase.status ?? 'pending');
      setProjectId(phase.project_id);
      setSortOrder(phase.sort_order);
      setTasks(await getPhaseTasks(id));
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to load phase');
      setMissing(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const save = async () => {
    if (!title.trim()) return Alert.alert('Required', 'Phase name is required');
    if (!projectId) return Alert.alert('Error', 'Phase project not found');
    setSaving(true);
    try {
      await savePhase({
        id,
        project_id: projectId,
        title: title.trim(),
        sort_order: sortOrder,
        description: description || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        status,
        is_completed: status === 'completed' ? 1 : 0,
      });
      Alert.alert('Saved', 'Phase updated', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    try {
      await savePhaseTask({ phase_id: id, title: newTask.trim(), sort_order: tasks.length });
      setNewTask('');
      setTasks(await getPhaseTasks(id));
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to add task');
    }
  };

  const toggleTask = async (task: PhaseTask) => {
    try {
      await savePhaseTask({ ...task, is_done: task.is_done ? 0 : 1 });
      setTasks(await getPhaseTasks(id));
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to update task');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (missing) {
    return (
      <View style={styles.centered}>
        <Text style={styles.missing}>Phase not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="secondary" />
      </View>
    );
  }

  return (
    <ScreenLayout>
      <Input label="Phase Name" value={title} onChangeText={setTitle} />
      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={{ minHeight: 80, textAlignVertical: 'top' }}
      />
      <DateInput label="Start Date" value={startDate} onChangeText={setStartDate} />
      <DateInput label="End Date" value={endDate} onChangeText={setEndDate} />
      <Dropdown label="Status" options={PHASE_STATUS_OPTIONS} value={status} onChange={setStatus} />
      <Text style={styles.taskTitle}>Tasks</Text>
      <Input label="New Task" value={newTask} onChangeText={setNewTask} placeholder="Task description" />
      <Button title="Add Task" onPress={addTask} variant="secondary" />
      {tasks.map((task) => (
        <ToggleRow
          key={task.id}
          label={task.title}
          value={!!task.is_done}
          onChange={() => toggleTask(task)}
        />
      ))}
      <Button title="Save Phase" onPress={save} loading={saving} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.container,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  missing: { ...typography.body, color: colors.onSurfaceVariant },
  taskTitle: { ...typography.title, fontSize: 15, color: colors.onSurface, marginVertical: spacing.sm },
});
