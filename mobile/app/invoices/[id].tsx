import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBadge } from '../../src/components/ui/StatusBadge';
import { Card } from '../../src/components/ui/Card';
import { Dropdown } from '../../src/components/ui/Dropdown';
import { Input } from '../../src/components/ui/Input';
import { MoneyInput } from '../../src/components/ui/MoneyInput';
import { DateInput } from '../../src/components/ui/DateInput';
import { Button } from '../../src/components/ui/Button';
import { ScreenLayout } from '../../src/components/ui/ScreenLayout';
import { FormSection } from '../../src/components/forms/FormSection';
import { INVOICE_STATUS_OPTIONS, PAYMENT_METHOD_OPTIONS } from '../../src/constants/options';
import { getInvoice, saveInvoice, getPaymentRecords, savePaymentRecord } from '../../src/db/queries';
import type { Invoice, LineItem, InvoiceStatus, PaymentRecord } from '../../src/types';
import { formatCurrency, formatDate } from '../../src/utils/format';
import { shareInvoicePdf, previewInvoicePdf } from '../../src/utils/invoicePdf';
import { colors, spacing, typography } from '../../src/theme';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payMethod, setPayMethod] = useState('bank_transfer');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingPay, setSavingPay] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const inv = await getInvoice(Number(id));
    setInvoice(inv);
    if (inv) setPayments(await getPaymentRecords(inv.id));
    setLoading(false);
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const updateStatus = async (status: string) => {
    if (!invoice) return;
    const items: LineItem[] = JSON.parse(invoice.line_items);
    await saveInvoice({
      id: invoice.id,
      project_id: invoice.project_id,
      invoice_number: invoice.invoice_number,
      date: invoice.date,
      line_items: items,
      subtotal: invoice.subtotal,
      discount: invoice.discount,
      discount_type: invoice.discount_type ?? undefined,
      tax: invoice.tax,
      tax_percent: invoice.tax_percent ?? undefined,
      total: invoice.total,
      status,
      payment_method: invoice.payment_method ?? undefined,
      notes: invoice.notes ?? undefined,
    });
    load();
  };

  const addPayment = async () => {
    if (!invoice) return;
    const amount = parseFloat(payAmount);
    if (!Number.isFinite(amount) || amount <= 0) return Alert.alert('Required', 'Enter valid amount');
    setSavingPay(true);
    try {
      await savePaymentRecord({
        invoice_id: invoice.id,
        amount,
        payment_date: payDate,
        payment_method: payMethod,
        reference: payRef || undefined,
        notes: payNotes || undefined,
      });
      setPayAmount(''); setPayRef(''); setPayNotes('');
      load();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to record payment');
    } finally {
      setSavingPay(false);
    }
  };

  const handleSharePdf = async () => {
    setGeneratingPdf(true);
    try {
      await shareInvoicePdf(Number(id));
    } catch (e) {
      Alert.alert('PDF Error', e instanceof Error ? e.message : 'Could not generate PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handlePreviewPdf = async () => {
    setGeneratingPdf(true);
    try {
      await previewInvoicePdf(Number(id));
    } catch (e) {
      Alert.alert('PDF Error', e instanceof Error ? e.message : 'Could not preview PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!invoice) {
    return (
      <View style={styles.centered}>
        <MaterialIcons name="error-outline" size={40} color={colors.error} />
        <Text style={styles.errorText}>Invoice not found</Text>
      </View>
    );
  }

  const lineItems: LineItem[] = JSON.parse(invoice.line_items);

  return (
    <ScreenLayout>
      <View style={styles.header}>
        <MaterialIcons name="receipt-long" size={28} color={colors.primary} />
        <View style={styles.headerText}>
          <Text style={styles.number}>{invoice.invoice_number}</Text>
          <Text style={styles.meta}>{invoice.client_name} · {invoice.project_name}</Text>
          <Text style={styles.date}>{formatDate(invoice.date)}</Text>
        </View>
        <StatusBadge status={invoice.status as InvoiceStatus} />
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Line Items</Text>
        {lineItems.map((item, i) => (
          <View key={i} style={styles.lineItem}>
            <Text style={styles.itemDesc}>{item.description}</Text>
            <Text style={styles.itemCalc}>
              {item.qty} × {formatCurrency(item.rate)} = {formatCurrency(item.amount)}
            </Text>
          </View>
        ))}
        <View style={styles.totals}>
          <Text style={styles.totalRow}>Subtotal: {formatCurrency(invoice.subtotal)}</Text>
          <Text style={styles.totalRow}>Tax: {formatCurrency(invoice.tax)}</Text>
          <Text style={styles.totalFinal}>Total: {formatCurrency(invoice.total)}</Text>
        </View>
      </Card>

      <Dropdown
        label="Payment Status"
        options={INVOICE_STATUS_OPTIONS}
        value={invoice.status}
        onChange={updateStatus}
      />

      <FormSection title="Record Payment">
        <MoneyInput
          label="Amount Received"
          value={payAmount}
          onChangeText={setPayAmount}
          placeholder="0"
          hint={
            invoice && parseFloat(payAmount) > 0
              ? `${((parseFloat(payAmount) / invoice.total) * 100).toFixed(1)}% of invoice total`
              : undefined
          }
        />
        <DateInput label="Payment Date" value={payDate} onChangeText={setPayDate} />
        <Dropdown label="Payment Method" options={PAYMENT_METHOD_OPTIONS} value={payMethod} onChange={setPayMethod} />
        <Input label="Reference / Transaction ID" value={payRef} onChangeText={setPayRef} />
        <Input label="Notes" value={payNotes} onChangeText={setPayNotes} />
        <Button title="Add Payment Record" onPress={addPayment} loading={savingPay} variant="secondary" />
        {payments.map((p) => (
          <View key={p.id} style={styles.payRow}>
            <MaterialIcons name="payments" size={18} color={colors.primary} />
            <Text style={styles.payText}>{formatCurrency(p.amount)} · {formatDate(p.payment_date)} · {p.payment_method}</Text>
          </View>
        ))}
      </FormSection>

      <FormSection title="Invoice PDF">
        <Button title="Preview PDF" onPress={handlePreviewPdf} loading={generatingPdf} variant="secondary" />
        <Button title="Generate & Share PDF" onPress={handleSharePdf} loading={generatingPdf} />
        <Text style={styles.pdfHint}>Uses your template blocks from Settings → Invoice Template.</Text>
      </FormSection>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  errorText: { ...typography.body, color: colors.error },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.lg },
  headerText: { flex: 1 },
  number: { ...typography.headline, fontSize: 20, color: colors.onSurface },
  meta: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 2 },
  date: { ...typography.caption, color: colors.outline },
  card: { marginBottom: spacing.lg },
  cardTitle: { ...typography.title, fontSize: 16, color: colors.onSurface, marginBottom: spacing.md },
  lineItem: { marginBottom: spacing.sm, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant + '30' },
  itemDesc: { ...typography.body, color: colors.onSurface },
  itemCalc: { ...typography.caption, color: colors.onSurfaceVariant, marginTop: 2 },
  totals: { marginTop: spacing.md },
  totalRow: { ...typography.bodySm, color: colors.onSurfaceVariant },
  totalFinal: { ...typography.title, color: colors.primary, marginTop: spacing.sm },
  pdfHint: { ...typography.caption, color: colors.onSurfaceVariant, marginTop: spacing.sm },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  payText: { ...typography.bodySm, color: colors.onSurface },
});
