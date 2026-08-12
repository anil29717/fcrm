import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../../theme';

export interface DropdownOption<T = string> {
  label: string;
  value: T;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

interface DropdownProps<T = string> {
  label: string;
  placeholder?: string;
  options: DropdownOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  disabled?: boolean;
}

export function Dropdown<T extends string | number>({
  label,
  placeholder = 'Select...',
  options,
  value,
  onChange,
  disabled,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.trigger, disabled && styles.disabled]}
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <View style={styles.triggerLeft}>
          {selected?.icon ? (
            <MaterialIcons name={selected.icon} size={20} color={colors.primary} style={styles.triggerIcon} />
          ) : null}
          <Text style={[styles.triggerText, !selected && styles.placeholder]}>
            {selected?.label ?? placeholder}
          </Text>
        </View>
        <MaterialIcons name="keyboard-arrow-down" size={24} color={colors.outline} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)} hitSlop={8}>
                <MaterialIcons name="close" size={22} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, item.value === value && styles.optionActive]}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  {item.icon ? (
                    <MaterialIcons name={item.icon} size={22} color={colors.primary} style={styles.optionIcon} />
                  ) : null}
                  <Text style={[styles.optionText, item.value === value && styles.optionTextActive]}>
                    {item.label}
                  </Text>
                  {item.value === value ? (
                    <MaterialIcons name="check" size={20} color={colors.primary} />
                  ) : null}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    backgroundColor: colors.surfaceContainerLow,
  },
  triggerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  triggerIcon: { marginRight: spacing.sm },
  triggerText: { ...typography.body, color: colors.onSurface, flex: 1 },
  placeholder: { color: colors.outline },
  disabled: { opacity: 0.5 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '60%',
    paddingBottom: spacing.xl,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.container,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant + '40',
  },
  sheetTitle: {
    ...typography.title,
    color: colors.onSurface,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.container,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant + '20',
  },
  optionActive: { backgroundColor: colors.primaryContainer + '15' },
  optionIcon: { marginRight: spacing.md },
  optionText: { ...typography.body, color: colors.onSurface, flex: 1 },
  optionTextActive: { fontWeight: '600', color: colors.primary },
});
