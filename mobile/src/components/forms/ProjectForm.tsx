import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Input } from '../ui/Input';
import { MoneyInput } from '../ui/MoneyInput';
import { Button } from '../ui/Button';
import { Dropdown } from '../ui/Dropdown';
import { DateInput } from '../ui/DateInput';
import { ScreenLayout } from '../ui/ScreenLayout';
import { FormSection } from './FormSection';
import { MultiSelect } from '../ui/MultiSelect';
import {
  PROJECT_TYPE_OPTIONS,
  PROJECT_PRIORITY_OPTIONS,
  BILLING_TYPE_OPTIONS,
  PROJECT_STATUS_OPTIONS,
} from '../../constants/options';
import { getClients, saveProject } from '../../db/queries';
import type { Client, ProjectInput } from '../../types';
import { colors, spacing, typography } from '../../theme';

interface ProjectFormProps {
  initial?: Partial<ProjectInput> & { id?: number };
  preselectedClientId?: number | null;
  onSaved: (id: number) => void;
}

export function ProjectForm({ initial, preselectedClientId, onSaved }: ProjectFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<number | null>(preselectedClientId ?? initial?.client_id ?? null);
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState(initial?.type ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [websiteUrl, setWebsiteUrl] = useState(initial?.website_url ?? '');
  const [startDate, setStartDate] = useState(initial?.start_date ?? '');
  const [endDate, setEndDate] = useState(initial?.end_date ?? '');
  const [priority, setPriority] = useState(initial?.priority ?? '');
  const [billingType, setBillingType] = useState(initial?.billing_type ?? 'fixed');
  const [projectValue, setProjectValue] = useState(String(initial?.project_value ?? ''));
  const [hourlyRate, setHourlyRate] = useState(initial?.hourly_rate ? String(initial.hourly_rate) : '');
  const [status, setStatus] = useState(initial?.status ?? 'active');
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [phaseInput, setPhaseInput] = useState('');
  const [phases, setPhases] = useState<string[]>(initial?.initial_phases ?? []);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => { getClients().then(setClients); }, []);

  const clientOptions = clients.map((c) => ({ label: c.name, value: c.id, icon: 'person' as const }));

  const addPhase = () => {
    if (!phaseInput.trim()) return;
    setPhases([...phases, phaseInput.trim()]);
    setPhaseInput('');
  };

  const handleSave = async () => {
    if (!clientId) return Alert.alert('Required', 'Select a client');
    if (!name.trim()) return Alert.alert('Required', 'Project name is required');
    if (!type) return Alert.alert('Required', 'Select project category');
    if (!billingType) return Alert.alert('Required', 'Select billing type');
    const value = parseFloat(projectValue);
    if (!Number.isFinite(value) || value < 0) return Alert.alert('Required', 'Enter valid project value');
    if (billingType === 'hourly') {
      const rate = parseFloat(hourlyRate);
      if (!Number.isFinite(rate) || rate <= 0) return Alert.alert('Required', 'Enter hourly rate');
    }
    setLoading(true);
    try {
      const id = await saveProject({
        id: initial?.id,
        client_id: clientId,
        name: name.trim(),
        type,
        description: description.trim() || undefined,
        website_url: websiteUrl.trim() || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        priority: priority || undefined,
        billing_type: billingType,
        project_value: value,
        hourly_rate: billingType === 'hourly' ? parseFloat(hourlyRate) : undefined,
        tags,
        status,
        initial_phases: initial?.id ? undefined : phases,
      });
      onSaved(id);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  if (clients.length === 0) {
    return (
      <ScreenLayout>
        <View style={styles.emptyBox}>
          <MaterialIcons name="group-off" size={36} color={colors.outline} />
          <Text style={styles.hint}>No clients yet. Add a client first.</Text>
          <Button title="Add Client" onPress={() => router.push('/clients/new')} variant="secondary" />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <FormSection title="Project Details">
        <Dropdown label="Client" options={clientOptions} value={clientId} onChange={setClientId} />
        <Input label="Project Name" value={name} onChangeText={setName} placeholder="Website Redesign" />
        <Dropdown label="Project Category" options={PROJECT_TYPE_OPTIONS} value={type || null} onChange={setType} />
        <Input label="Description" value={description} onChangeText={setDescription} multiline numberOfLines={3} style={{ minHeight: 80, textAlignVertical: 'top' }} />
        <Input label="Website URL" value={websiteUrl} onChangeText={setWebsiteUrl} autoCapitalize="none" keyboardType="url" />
        <DateInput label="Start Date" value={startDate} onChangeText={setStartDate} />
        <DateInput label="Expected End Date" value={endDate} onChangeText={setEndDate} />
        <Dropdown label="Priority" options={PROJECT_PRIORITY_OPTIONS} value={priority || null} onChange={setPriority} placeholder="Optional" />
        <Dropdown label="Billing Type" options={BILLING_TYPE_OPTIONS} value={billingType} onChange={setBillingType} />
        <MoneyInput label="Project Value / Budget" value={projectValue} onChangeText={setProjectValue} placeholder="0" />
        {billingType === 'hourly' ? (
          <MoneyInput label="Hourly Rate" value={hourlyRate} onChangeText={setHourlyRate} placeholder="0" />
        ) : null}
        <Dropdown label="Status" options={PROJECT_STATUS_OPTIONS} value={status} onChange={setStatus} />
        <MultiSelect label="Tags" options={CLIENT_TAG_OPTIONS} values={tags} onChange={setTags} />
      </FormSection>
      {!initial?.id ? (
        <FormSection title="Initial Phases">
          <View style={styles.phaseRow}>
            <Input label="Phase Name" value={phaseInput} onChangeText={setPhaseInput} placeholder="e.g. Design" />
            <TouchableOpacity style={styles.phaseAdd} onPress={addPhase}>
              <MaterialIcons name="add" size={22} color={colors.onPrimary} />
            </TouchableOpacity>
          </View>
          {phases.map((p, i) => (
            <View key={i} style={styles.phaseChip}>
              <Text style={styles.phaseText}>{p}</Text>
              <TouchableOpacity onPress={() => setPhases(phases.filter((_, j) => j !== i))}>
                <MaterialIcons name="close" size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </FormSection>
      ) : null}
      <Button title={initial?.id ? 'Save Changes' : 'Create Project'} onPress={handleSave} loading={loading} />
    </ScreenLayout>
  );
}

const CLIENT_TAG_OPTIONS = [
  { label: 'VIP', value: 'vip', icon: 'star' as const },
  { label: 'Recurring', value: 'recurring', icon: 'repeat' as const },
  { label: 'One-time', value: 'one_time', icon: 'looks-one' as const },
];

const styles = StyleSheet.create({
  emptyBox: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  hint: { ...typography.bodySm, color: colors.warning, textAlign: 'center' },
  phaseRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  phaseAdd: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  phaseChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surfaceContainerLow, padding: spacing.sm, borderRadius: 8, marginBottom: spacing.xs },
  phaseText: { ...typography.bodySm, color: colors.onSurface, flex: 1 },
});
