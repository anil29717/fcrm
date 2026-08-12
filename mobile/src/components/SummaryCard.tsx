import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';

interface SummaryCardProps {
  label: string;
  value: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

export function SummaryCard({ label, value, icon }: SummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <MaterialIcons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: spacing.md,
    height: 110,
    justifyContent: 'space-between',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  label: { ...typography.label, color: colors.onSurfaceVariant, flex: 1 },
  value: { ...typography.headline, color: colors.onSurface, fontSize: 22 },
});
