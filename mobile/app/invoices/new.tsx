import { useState, useEffect } from 'react';
import { StyleSheet, Alert, View, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Input } from '../../src/components/ui/Input';
import { MoneyInput } from '../../src/components/ui/MoneyInput';
import { Button } from '../../src/components/ui/Button';
import { Dropdown } from '../../src/components/ui/Dropdown';
import { DateInput } from '../../src/components/ui/DateInput';
import { ScreenLayout } from '../../src/components/ui/ScreenLayout';
import { LineItemsEditor } from '../../src/components/forms/LineItemsEditor';
import {
  INVOICE_STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  DISCOUNT_TYPE_OPTIONS,
} from '../../src/constants/options';
import { getProjects, previewNextInvoiceNumber, createInvoice, getProject } from '../../src/db/queries';
import type { Project, LineItem } from '../../src/types';
import { colors, spacing, typography, radius } from '../../src/theme';

function parseParamId(value?: string | string[]): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export default function NewInvoiceScreen() {
  const params = useLocalSearchParams<{ projectId?: string | string[] }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<number | null>(parseParamId(params.projectId));
  const [projectValue, setProjectValue] = useState(0);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: '', qty: 1, rate: 0, amount: 0 }]);
  const [discount, setDiscount] = useState('0');
  const [discountType, setDiscountType] = useState('amount');
  const [taxPercent, setTaxPercent] = useState('0');
  const [status, setStatus] = useState('draft');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await getProjects();
        if (!cancelled) setProjects(list);
      } catch (e) {
        if (!cancelled) {
          Alert.alert('Error', e instanceof Error ? e.message : 'Failed to load projects');
        }
      }
      try {
        const next = await previewNextInvoiceNumber();
        if (!cancelled) setInvoiceNumber(next);
      } catch (e) {
        if (!cancelled) {
          Alert.alert(
            'Setup required',
            e instanceof Error ? e.message : 'Could not generate invoice number. Complete company setup first.',
          );
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const fromParams = parseParamId(params.projectId);
    if (fromParams != null) setProjectId(fromParams);
  }, [params.projectId]);

  useEffect(() => {
    if (!projectId) {
      setProjectValue(0);
      return;
    }
    getProject(projectId)
      .then((p) => setProjectValue(p?.project_value ?? 0))
      .catch(() => setProjectValue(0));
  }, [projectId]);

  const subtotal = lineItems.reduce((s, i) => s + i.amount, 0);
  const discountVal = parseFloat(discount) || 0;
  const discountAmount = discountType === 'percent' ? (subtotal * discountVal) / 100 : discountVal;
  const discountPercentOfSubtotal = subtotal > 0 ? (discountAmount / subtotal) * 100 : 0;
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (afterDiscount * (parseFloat(taxPercent) || 0)) / 100;
  const total = afterDiscount + taxAmount;
  const percentOfProject = projectValue > 0 ? (total / projectValue) * 100 : null;

  const handleSave = async () => {
    if (!projectId) return Alert.alert('Required', 'Select a project');
    const validItems = lineItems.filter((i) => i.description.trim() && i.rate > 0);
    if (validItems.length === 0) return Alert.alert('Required', 'Add at least one line item');
    setLoading(true);
    try {
      const id = await createInvoice({
        project_id: projectId,
        date: invoiceDate,
        line_items: validItems,
        subtotal,
        discount: discountAmount,
        discount_type: discountType,
        tax: taxAmount,
        tax_percent: parseFloat(taxPercent) || 0,
        total,
        status,
        payment_method: paymentMethod || undefined,
        notes: notes || undefined,
      });
      Alert.alert('Success', 'Invoice created', [
        { text: 'View', onPress: () => router.replace(`/invoices/${id}`) },
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const projectOptions = projects.map((p) => ({
    label: `${p.name} (${p.client_name})`,
    value: p.id,
    icon: 'folder-open' as const,
  }));

  return (
    <ScreenLayout>
      <View style={styles.invoiceHeader}>
        <MaterialIcons name="receipt-long" size={28} color={colors.primary} />
        <View style={styles.invoiceHeaderText}>
          <Text style={styles.invoiceLabel}>Invoice Number</Text>
          <Text style={styles.invoiceNum}>{invoiceNumber || '—'}</Text>
        </View>
      </View>

      {projects.length === 0 ? (
        <View style={styles.emptyBox}>
          <MaterialIcons name="folder-off" size={32} color={colors.outline} />
          <Text style={styles.emptyText}>No projects yet. Create a project first.</Text>
          <Button title="Go to Projects" onPress={() => router.push('/(tabs)/projects')} variant="secondary" />
        </View>
      ) : (
        <>
          <Dropdown label="Client / Project" options={projectOptions} value={projectId} onChange={setProjectId} />
          <DateInput label="Invoice Date" value={invoiceDate} onChangeText={setInvoiceDate} />
          <LineItemsEditor items={lineItems} onChange={setLineItems} />
          <Dropdown
            label="Discount Type"
            options={DISCOUNT_TYPE_OPTIONS}
            value={discountType}
            onChange={(v) => {
              setDiscountType(v);
              setDiscount('0');
            }}
          />
          {discountType === 'percent' ? (
            <Input
              label="Discount %"
              value={discount}
              onChangeText={setDiscount}
              keyboardType="decimal-pad"
            />
          ) : (
            <MoneyInput
              label="Discount Amount"
              value={discount}
              onChangeText={setDiscount}
              hint={subtotal > 0 ? `Equals ${discountPercentOfSubtotal.toFixed(1)}% of subtotal` : undefined}
            />
          )}
          <Input label="Tax / GST %" value={taxPercent} onChangeText={setTaxPercent} keyboardType="decimal-pad" />
          <Dropdown label="Status" options={INVOICE_STATUS_OPTIONS} value={status} onChange={setStatus} />
          <Dropdown
            label="Payment Method"
            options={PAYMENT_METHOD_OPTIONS}
            value={paymentMethod || null}
            onChange={setPaymentMethod}
            placeholder="Optional"
          />
          <Input
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />

          <View style={styles.totals}>
            <Text style={styles.totalRow}>Subtotal: ₹{subtotal.toFixed(2)}</Text>
            <Text style={styles.totalRow}>
              Discount: −₹{discountAmount.toFixed(2)}
              {subtotal > 0 ? ` (${discountPercentOfSubtotal.toFixed(1)}%)` : ''}
            </Text>
            <Text style={styles.totalRow}>
              Tax ({parseFloat(taxPercent) || 0}%): ₹{taxAmount.toFixed(2)}
            </Text>
            <Text style={styles.totalFinal}>Total: ₹{total.toFixed(2)}</Text>
            {percentOfProject != null ? (
              <Text style={styles.percentNote}>
                {percentOfProject.toFixed(1)}% of project value (₹{projectValue.toFixed(2)})
              </Text>
            ) : null}
          </View>
          <Button title="Create Invoice" onPress={handleSave} loading={loading} />
        </>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  invoiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
  },
  invoiceHeaderText: { flex: 1 },
  invoiceLabel: { ...typography.caption, color: colors.onSurfaceVariant },
  invoiceNum: { ...typography.headline, fontSize: 18, color: colors.primary },
  emptyBox: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  emptyText: { ...typography.bodySm, color: colors.onSurfaceVariant, textAlign: 'center' },
  totals: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  totalRow: { ...typography.bodySm, color: colors.onSurfaceVariant },
  totalFinal: { ...typography.title, color: colors.primary, marginTop: spacing.sm },
  percentNote: { ...typography.caption, color: colors.primary, marginTop: spacing.xs },
});
