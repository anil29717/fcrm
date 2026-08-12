import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../../theme';

interface SearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
}

export function SearchField({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Search...',
}: SearchFieldProps) {
  return (
    <View style={styles.wrap}>
      <MaterialIcons name="search" size={20} color={colors.outline} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.outline}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: spacing.container,
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    left: spacing.container + 12,
    top: spacing.container + 14,
    zIndex: 1,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    paddingLeft: 44,
    paddingRight: spacing.md,
    paddingVertical: 12,
    color: colors.onSurface,
  },
});
