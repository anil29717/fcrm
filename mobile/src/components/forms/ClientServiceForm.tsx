import { useState } from 'react';
import { Alert } from 'react-native';
import { Input } from '../ui/Input';
import { MoneyInput } from '../ui/MoneyInput';
import { DateInput } from '../ui/DateInput';
import { Dropdown } from '../ui/Dropdown';
import { ToggleRow } from '../ui/ToggleRow';
import { Button } from '../ui/Button';
import { ScreenLayout } from '../ui/ScreenLayout';
import { FormSection } from './FormSection';
import { PAYMENT_METHOD_OPTIONS, SERVICE_PAYMENT_STATUS_OPTIONS } from '../../constants/options';
import { saveClientService } from '../../db/queries';
import type { ClientService, ClientServicePaymentStatus } from '../../types';

interface ClientServiceFormProps {
  clientId: number;
  initial?: ClientService | null;
  onSaved: (id: number) => void;
  onDelete?: () => void;
  onViewInvoice?: (invoiceId: number) => void;
}

export function ClientServiceForm({
  clientId,
  initial,
  onSaved,
  onDelete,
  onViewInvoice,
}: ClientServiceFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [serviceDate, setServiceDate] = useState(
    initial?.service_date ?? new Date().toISOString().split('T')[0],
  );
  const [paymentStatus, setPaymentStatus] = useState(initial?.payment_status ?? 'unpaid');
  const [paidAmount, setPaidAmount] = useState(
    initial && initial.paid_amount > 0 ? String(initial.paid_amount) : '',
  );
  const [paymentDate, setPaymentDate] = useState(
    initial?.payment_date ?? new Date().toISOString().split('T')[0],
  );
  const [paymentMethod, setPaymentMethod] = useState(initial?.payment_method ?? '');
  const [paymentReference, setPaymentReference] = useState(initial?.payment_reference ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [createInvoice, setCreateInvoice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const showPaymentFields = paymentStatus === 'paid' || paymentStatus === 'partial';
  const hasInvoice = !!initial?.invoice_id;

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Enter what you did for this client');
      return;
    }
    const charge = parseFloat(amount);
    if (!Number.isFinite(charge) || charge < 0) {
      Alert.alert('Required', 'Enter a valid amount');
      return;
    }
    if (paymentStatus === 'partial') {
      const received = parseFloat(paidAmount);
      if (!Number.isFinite(received) || received <= 0) {
        Alert.alert('Required', 'Enter how much they paid');
        return;
      }
    }
    setLoading(true);
    try {
      const id = await saveClientService({
        id: initial?.id,
        client_id: clientId,
        title: title.trim(),
        description: description.trim() || undefined,
        amount: charge,
        service_date: serviceDate,
        payment_status: paymentStatus as ClientServicePaymentStatus,
        paid_amount: showPaymentFields ? parseFloat(paidAmount) || undefined : 0,
        payment_date: showPaymentFields ? paymentDate : undefined,
        payment_method: showPaymentFields ? paymentMethod || undefined : undefined,
        payment_reference: showPaymentFields ? paymentReference.trim() || undefined : undefined,
        notes: notes.trim() || undefined,
        create_invoice: !hasInvoice && createInvoice,
      });
      onSaved(id);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!onDelete) return;
    Alert.alert(
      'Delete this work?',
      'This removes the other-service record. Any invoice already created is kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await onDelete();
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <ScreenLayout>
      <FormSection title="What you did">
        <Input
          label="Service / work"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Onsite visit, logo tweak, emergency fix"
        />
        <Input
          label="Details"
          value={description}
          onChangeText={setDescription}
          placeholder="Optional notes about the work"
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />
        <DateInput label="Date" value={serviceDate} onChangeText={setServiceDate} />
        <MoneyInput
          label="Amount charged"
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
        />
      </FormSection>

      <FormSection title="Payment">
        <Dropdown
          label="Payment status"
          options={SERVICE_PAYMENT_STATUS_OPTIONS}
          value={paymentStatus}
          onChange={setPaymentStatus}
        />
        {showPaymentFields ? (
          <>
            <MoneyInput
              label="Amount received"
              value={paidAmount}
              onChangeText={setPaidAmount}
              placeholder={paymentStatus === 'paid' ? amount || '0' : '0'}
              hint={paymentStatus === 'paid' ? 'Leave blank to use the full charged amount' : undefined}
            />
            <DateInput label="Payment date" value={paymentDate} onChangeText={setPaymentDate} />
            <Dropdown
              label="Payment method"
              options={PAYMENT_METHOD_OPTIONS}
              value={paymentMethod || null}
              onChange={setPaymentMethod}
              placeholder="Optional"
            />
            <Input
              label="Reference"
              value={paymentReference}
              onChangeText={setPaymentReference}
              placeholder="UPI / txn id / receipt no."
            />
          </>
        ) : null}
        <Input
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={2}
          style={{ minHeight: 64, textAlignVertical: 'top' }}
        />
      </FormSection>

      <FormSection title="Invoice">
        {hasInvoice ? (
          <Button
            title={`View invoice ${initial?.invoice_number ?? ''}`.trim()}
            variant="secondary"
            onPress={() => initial?.invoice_id && onViewInvoice?.(initial.invoice_id)}
          />
        ) : (
          <ToggleRow
            label="Create invoice"
            subtitle="Optional. Turn on only if you want a numbered invoice for this work."
            value={createInvoice}
            onChange={setCreateInvoice}
          />
        )}
      </FormSection>

      <Button
        title={initial?.id ? 'Save Changes' : 'Save Service'}
        onPress={handleSave}
        loading={loading}
      />
      {onDelete ? (
        <Button title="Delete" variant="danger" onPress={handleDelete} loading={deleting} style={{ marginTop: 12 }} />
      ) : null}
    </ScreenLayout>
  );
}
