import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Input } from '../ui/Input';
import { MoneyInput } from '../ui/MoneyInput';
import type { LineItem } from '../../types';
import { colors, spacing, typography, radius } from '../../theme';

interface LineItemsEditorProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
}

function recalc(item: LineItem): LineItem {
  const qty = item.qty || 0;
  const rate = item.rate || 0;
  return { ...item, amount: qty * rate };
}

export function LineItemsEditor({ items, onChange }: LineItemsEditorProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);

  const update = (index: number, patch: Partial<LineItem>) => {
    const next = items.map((item, i) => (i === index ? recalc({ ...item, ...patch }) : item));
    onChange(next);
  };

  const addRow = () => {
    onChange([...items, { description: '', qty: 1, rate: 0, amount: 0 }]);
  };

  const removeRow = (index: number) => {
    if (items.length <= 1) return;
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>Line Items</Text>
        <TouchableOpacity style={styles.addBtn} onPress={addRow}>
          <MaterialIcons name="add" size={18} color={colors.onPrimary} />
          <Text style={styles.addText}>Add row</Text>
        </TouchableOpacity>
      </View>
      {items.map((item, index) => {
        const pct = subtotal > 0 ? (item.amount / subtotal) * 100 : 0;
        return (
          <View key={index} style={styles.row}>
            <View style={styles.rowHeader}>
              <Text style={styles.rowNum}>#{index + 1}</Text>
              {items.length > 1 ? (
                <TouchableOpacity onPress={() => removeRow(index)}>
                  <MaterialIcons name="delete-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              ) : null}
            </View>
            <Input
              label="Description"
              value={item.description}
              onChangeText={(v) => update(index, { description: v })}
              placeholder="Service or product"
            />
            <View style={styles.inline}>
              <View style={styles.third}>
                <Input
                  label="Qty"
                  value={item.qty ? String(item.qty) : ''}
                  onChangeText={(v) => update(index, { qty: parseFloat(v) || 0 })}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.third}>
                <MoneyInput
                  label="Rate"
                  value={item.rate ? String(item.rate) : ''}
                  onChangeText={(v) => update(index, { rate: parseFloat(v) || 0 })}
                  placeholder="0"
                />
              </View>
              <View style={styles.third}>
                <Text style={styles.amountLabel}>Amount</Text>
                <Text style={styles.amount}>₹{(item.amount || 0).toFixed(2)}</Text>
                <Text style={styles.pct}>{pct.toFixed(1)}%</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  title: { ...typography.title, fontSize: 16, color: colors.onSurface },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.lg,
  },
  addText: { ...typography.caption, color: colors.onPrimary, fontWeight: '600' },
  row: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant + '50',
  },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  rowNum: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  inline: { flexDirection: 'row', gap: spacing.sm },
  third: { flex: 1 },
  amountLabel: { ...typography.label, color: colors.onSurfaceVariant, marginBottom: spacing.xs, textTransform: 'uppercase' },
  amount: { ...typography.body, fontWeight: '600', color: colors.onSurface, paddingTop: 12 },
  pct: { ...typography.caption, color: colors.primary, marginTop: 2 },
});
