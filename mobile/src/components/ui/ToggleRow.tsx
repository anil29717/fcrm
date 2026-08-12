import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface ToggleRowProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  subtitle?: string;
}

export function ToggleRow({ label, value, onChange, subtitle }: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.body}>
        <Text style={styles.label}>{label}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.primaryContainer }}
        thumbColor={value ? colors.primary : colors.outline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  body: { flex: 1, marginRight: spacing.md },
  label: { ...typography.body, color: colors.onSurface },
  subtitle: { ...typography.caption, color: colors.onSurfaceVariant, marginTop: 2 },
});
