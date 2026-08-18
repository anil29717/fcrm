import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, typography } from '../../theme';

type StatusType =
  | 'paid' | 'pending' | 'partial' | 'overdue'
  | 'draft' | 'sent' | 'cancelled'
  | 'in_progress' | 'active' | 'completed' | 'on_hold' | 'not_started' | 'cancelled'
  | 'invoiced' | 'pending_approval' | 'approved' | 'unpaid';

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  paid: { bg: '#D1FAE5', text: colors.paid, label: 'Paid' },
  pending: { bg: '#FEF3C7', text: colors.pending, label: 'Pending' },
  partial: { bg: '#DBEAFE', text: colors.partial, label: 'Partial' },
  overdue: { bg: '#FEE2E2', text: colors.overdue, label: 'Overdue' },
  draft: { bg: '#E5E7EB', text: colors.onSurfaceVariant, label: 'Draft' },
  sent: { bg: '#DBEAFE', text: colors.partial, label: 'Sent' },
  cancelled: { bg: '#FEE2E2', text: colors.error, label: 'Cancelled' },
  in_progress: { bg: '#FEF3C7', text: colors.pending, label: 'In Progress' },
  active: { bg: '#D1FAE5', text: colors.paid, label: 'Active' },
  not_started: { bg: '#E5E7EB', text: colors.onSurfaceVariant, label: 'Not Started' },
  completed: { bg: '#D1FAE5', text: colors.paid, label: 'Completed' },
  on_hold: { bg: '#E5E7EB', text: colors.onSurfaceVariant, label: 'On Hold' },
  invoiced: { bg: '#DBEAFE', text: colors.partial, label: 'Invoiced' },
  pending_approval: { bg: '#FEF3C7', text: colors.pending, label: 'Pending Approval' },
  approved: { bg: '#D1FAE5', text: colors.paid, label: 'Approved' },
  unpaid: { bg: '#FEF3C7', text: colors.pending, label: 'Unpaid' },
};

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>
        {label ?? config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  text: { ...typography.label, fontSize: 11 },
});
