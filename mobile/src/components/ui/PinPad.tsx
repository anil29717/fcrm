import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';

interface PinPadProps {
  value: string;
  onChange: (pin: string) => void;
  maxLength?: number;
  title?: string;
  subtitle?: string;
}

export function PinPad({ value, onChange, maxLength = 6, title, subtitle }: PinPadProps) {
  const handlePress = (digit: string) => {
    if (digit === 'del') {
      onChange(value.slice(0, -1));
      return;
    }
    if (value.length < maxLength) {
      onChange(value + digit);
    }
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <View style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.dots}>
        {Array.from({ length: maxLength }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i < value.length && styles.dotFilled]}
          />
        ))}
      </View>
      <View style={styles.grid}>
        {keys.map((key, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.key, !key && styles.keyEmpty]}
            onPress={() => key && handlePress(key)}
            disabled={!key}
            activeOpacity={0.7}
          >
            {key === 'del' ? (
              <MaterialIcons name="backspace" size={24} color={colors.onSurface} />
            ) : (
              <Text style={styles.keyText}>{key}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: spacing.container },
  title: { ...typography.headline, color: colors.onSurface, marginBottom: spacing.sm },
  subtitle: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.outline,
  },
  dotFilled: { backgroundColor: colors.primary, borderColor: colors.primary },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 280,
    justifyContent: 'center',
  },
  key: {
    width: 80,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLowest,
  },
  keyEmpty: { backgroundColor: 'transparent' },
  keyText: { ...typography.headline, color: colors.onSurface },
});
