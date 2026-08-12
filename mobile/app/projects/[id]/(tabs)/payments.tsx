import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBadge } from '../../../../src/components/ui/StatusBadge';
import { Dropdown } from '../../../../src/components/ui/Dropdown';
import { DateInput } from '../../../../src/components/ui/DateInput';
import { MoneyInput } from '../../../../src/components/ui/MoneyInput';
import { ToggleRow } from '../../../../src/components/ui/ToggleRow';
import { InvalidProjectFallback } from '../../../../src/components/ui/InvalidProjectFallback';
import { useProjectId } from '../../../../src/hooks/useProjectId';
import { MILESTONE_STATUS_OPTIONS, CHANGE_REQUEST_STATUS_OPTIONS } from '../../../../src/constants/options';
import {
  getInvoicesByProject,
  getMilestones,
  getChangeRequests,
  saveMilestone,
  saveChangeRequest,
  getProjectPaymentSummary,
} from '../../../../src/db/queries';
import type { Invoice, Milestone, ChangeRequest } from '../../../../src/types';
import { formatCurrency, formatDate } from '../../../../src/utils/format';
import { colors, spacing, typography, radius } from '../../../../src/theme';

export default function ProjectPaymentsScreen() {
  const projectId = useProjectId();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneAmount, setMilestoneAmount] = useState('');
  const [milestoneStatus, setMilestoneStatus] = useState('pending');
  const [changeDesc, setChangeDesc] = useState('');
  const [changeCharge, setChangeCharge] = useState('');
  const [changeDate, setChangeDate] = useState(new Date().toISOString().split('T')[0]);
  const [changeScope, setChangeScope] = useState('');
  const [changeApproved, setChangeApproved] = useState(false);
  const [changeStatus, setChangeStatus] = useState('pending_approval');
  const [summary, setSummary] = useState({ projectValue: 0, totalReceived: 0, amountRemaining: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [kbHeight, setKbHeight] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKbHeight(e.endCoordinates.height),
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKbHeight(0),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [inv, mil, cr, sum] = await Promise.all([
        getInvoicesByProject(projectId),
        getMilestones(projectId),
        getChangeRequests(projectId),
        getProjectPaymentSummary(projectId),
      ]);
      setInvoices(inv);
      setMilestones(mil);
      setChangeRequests(cr);
      setSummary(sum);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!projectId) {
    return <InvalidProjectFallback />;
  }

  const addMilestone = async () => {
    if (!milestoneTitle.trim()) {
      Alert.alert('Required', 'Enter a milestone title');
      return;
    }
    const amount = parseFloat(milestoneAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Required', 'Enter a valid amount');
      return;
    }
    setSaving(true);
    try {
      await saveMilestone({
        project_id: projectId,
        title: milestoneTitle.trim(),
        amount,
        due_status: milestoneStatus,
      });
      setMilestoneTitle('');
      setMilestoneAmount('');
      setMilestoneStatus('pending');
      await load();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to add milestone');
    } finally {
      setSaving(false);
    }
  };

  const addChangeRequest = async () => {
    if (!changeDesc.trim()) {
      Alert.alert('Required', 'Enter a description');
      return;
    }
    const charge = parseFloat(changeCharge);
    if (!Number.isFinite(charge) || charge < 0) {
      Alert.alert('Required', 'Enter a valid charge amount');
      return;
    }
    setSaving(true);
    try {
      await saveChangeRequest({
        project_id: projectId,
        description: changeDesc.trim(),
        charge,
        date: changeDate,
        scope_hours: changeScope || undefined,
        client_approved: changeApproved,
        status: changeStatus,
      });
      setChangeDesc('');
      setChangeCharge('');
      setChangeScope('');
      setChangeApproved(false);
      setChangeStatus('pending_approval');
      await load();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to add change request');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: spacing.xl * 3 + (kbHeight > 0 ? 160 : 0) }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      >
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Payment Summary</Text>
        <Text style={styles.summaryRow}>Project Total: {formatCurrency(summary.projectValue)}</Text>
        <Text style={styles.summaryRow}>Total Received: {formatCurrency(summary.totalReceived)}</Text>
        <Text style={styles.summaryRemaining}>Remaining: {formatCurrency(summary.amountRemaining)}</Text>
      </View>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <MaterialIcons name="receipt-long" size={22} color={colors.primary} />
          <Text style={styles.sectionTitle}>Invoices</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            try {
              router.push({ pathname: '/invoices/create', params: { projectId: String(projectId) } });
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'Could not open invoice form');
            }
          }}
        >
          <MaterialIcons name="add" size={18} color={colors.onPrimary} />
          <Text style={styles.addBtnText}>New Invoice</Text>
        </TouchableOpacity>
      </View>
      {invoices.length === 0 ? (
        <Text style={styles.empty}>No invoices for this project.</Text>
      ) : (
        invoices.map((inv) => (
          <TouchableOpacity key={inv.id} style={styles.card} onPress={() => router.push(`/invoices/${inv.id}`)}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{inv.invoice_number}</Text>
              <StatusBadge status={inv.status as 'paid' | 'pending' | 'partial'} />
            </View>
            <Text style={styles.cardMeta}>{formatDate(inv.date)} · {formatCurrency(inv.total)}</Text>
          </TouchableOpacity>
        ))
      )}

      <View style={[styles.sectionHeader, styles.sectionGap]}>
        <View style={styles.sectionTitleRow}>
          <MaterialIcons name="flag" size={22} color={colors.primary} />
          <Text style={styles.sectionTitle}>Milestones</Text>
        </View>
      </View>
      <View style={styles.formCard}>
        <TextInput
          style={styles.input}
          placeholder="Milestone title (e.g. 50% advance)"
          value={milestoneTitle}
          onChangeText={setMilestoneTitle}
          placeholderTextColor={colors.outline}
        />
        <MoneyInput
          label="Amount"
          value={milestoneAmount}
          onChangeText={setMilestoneAmount}
          placeholder="0"
          hint={
            summary.projectValue > 0 && parseFloat(milestoneAmount) > 0
              ? `${((parseFloat(milestoneAmount) / summary.projectValue) * 100).toFixed(1)}% of project value`
              : undefined
          }
        />
        <Dropdown
          label="Status"
          options={MILESTONE_STATUS_OPTIONS}
          value={milestoneStatus}
          onChange={setMilestoneStatus}
        />
        <TouchableOpacity style={styles.saveBtn} onPress={addMilestone} disabled={saving}>
          <MaterialIcons name="add-circle" size={20} color={colors.onPrimary} />
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Add Milestone'}</Text>
        </TouchableOpacity>
      </View>
      {milestones.map((m) => (
        <View key={m.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{m.title}</Text>
            <StatusBadge status={m.due_status as 'paid' | 'pending' | 'overdue'} />
          </View>
          <Text style={styles.cardMeta}>{formatCurrency(m.amount)}</Text>
        </View>
      ))}

      <View style={[styles.sectionHeader, styles.sectionGap]}>
        <View style={styles.sectionTitleRow}>
          <MaterialIcons name="change-circle" size={22} color={colors.primary} />
          <Text style={styles.sectionTitle}>Change Requests</Text>
        </View>
      </View>
      <View style={styles.formCard}>
        <TextInput
          style={styles.input}
          placeholder="Extra work description"
          value={changeDesc}
          onChangeText={setChangeDesc}
          placeholderTextColor={colors.outline}
        />
        <MoneyInput
          label="Charge amount"
          value={changeCharge}
          onChangeText={setChangeCharge}
          placeholder="0"
          hint={
            summary.projectValue > 0 && parseFloat(changeCharge) > 0
              ? `${((parseFloat(changeCharge) / summary.projectValue) * 100).toFixed(1)}% of project value`
              : undefined
          }
        />
        <DateInput label="Date" value={changeDate} onChangeText={setChangeDate} />
        <TextInput style={styles.input} placeholder="Additional scope / hours" value={changeScope} onChangeText={setChangeScope} placeholderTextColor={colors.outline} />
        <ToggleRow label="Client Approved" value={changeApproved} onChange={setChangeApproved} />
        <Dropdown label="Status" options={CHANGE_REQUEST_STATUS_OPTIONS} value={changeStatus} onChange={setChangeStatus} />
        <TouchableOpacity style={styles.saveBtn} onPress={addChangeRequest} disabled={saving}>
          <MaterialIcons name="add-circle" size={20} color={colors.onPrimary} />
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Add Change Request'}</Text>
        </TouchableOpacity>
      </View>
      {changeRequests.map((cr) => (
        <View key={cr.id} style={styles.card}>
          <Text style={styles.cardTitle}>{cr.description}</Text>
          <Text style={styles.cardMeta}>{formatDate(cr.date)} · {formatCurrency(cr.charge)}</Text>
        </View>
      ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.container, paddingBottom: spacing.xl * 3 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  errorText: { ...typography.body, color: colors.error },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionTitle: { ...typography.title, fontSize: 18, color: colors.onSurface },
  sectionGap: { marginTop: spacing.lg },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryContainer, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.lg, gap: 4 },
  addBtnText: { ...typography.label, color: colors.onPrimary },
  formCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  card: { backgroundColor: colors.surfaceContainerLowest, borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', padding: spacing.md, marginBottom: spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { ...typography.body, fontWeight: '600', color: colors.onSurface, flex: 1 },
  cardMeta: { ...typography.caption, color: colors.onSurfaceVariant, marginTop: 4 },
  empty: { ...typography.bodySm, color: colors.onSurfaceVariant, marginBottom: spacing.md },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLow,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryContainer,
    padding: 12,
    borderRadius: radius.lg,
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  saveBtnText: { ...typography.label, color: colors.onPrimary },
  summaryCard: { backgroundColor: colors.primary + '12', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.primary + '30' },
  summaryTitle: { ...typography.title, fontSize: 16, color: colors.primary, marginBottom: spacing.sm },
  summaryRow: { ...typography.bodySm, color: colors.onSurface },
  summaryRemaining: { ...typography.body, fontWeight: '700', color: colors.primary, marginTop: spacing.xs },
});
