import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';

export function InvalidProjectFallback() {
  return (
    <View style={styles.centered}>
      <MaterialIcons name="error-outline" size={40} color={colors.error} />
      <Text style={styles.errorText}>Could not load project. Go back and try again.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.container },
  errorText: { ...typography.body, color: colors.error, textAlign: 'center' },
});
