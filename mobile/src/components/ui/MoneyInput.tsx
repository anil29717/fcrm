import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

interface MoneyInputProps extends Omit<TextInputProps, 'value' | 'onChangeText' | 'keyboardType'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  hint?: string;
}

/** Keep only digits and one decimal point while typing. */
export function sanitizeMoneyInput(text: string): string {
  const cleaned = text.replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join('')}`;
}

export function MoneyInput({
  label,
  value,
  onChangeText,
  error,
  hint,
  style,
  ...props
}: MoneyInputProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.row, error && styles.rowError]}>
        <Text style={styles.symbol}>₹</Text>
        <TextInput
          style={[styles.input, style]}
          value={value}
          onChangeText={(text) => onChangeText(sanitizeMoneyInput(text))}
          placeholderTextColor={colors.outline}
          keyboardType="decimal-pad"
          {...props}
        />
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label: {
    ...typography.label,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: spacing.md,
  },
  rowError: { borderColor: colors.error },
  symbol: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary,
    marginRight: spacing.sm,
  },
  input: {
    ...typography.body,
    flex: 1,
    paddingVertical: 12,
    color: colors.onSurface,
  },
  hint: { ...typography.caption, color: colors.onSurfaceVariant, marginTop: 4 },
  error: { ...typography.caption, color: colors.error, marginTop: 4 },
});
