import { Text, View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ClientServiceForm } from '../../../src/components/forms/ClientServiceForm';
import { colors, spacing, typography } from '../../../src/theme';

function parseId(value?: string | string[]): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export default function NewClientServiceScreen() {
  const { clientId } = useLocalSearchParams<{ clientId?: string | string[] }>();
  const id = parseId(clientId);
  const router = useRouter();

  if (!id) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Open this form from a client to add other work.</Text>
      </View>
    );
  }

  return (
    <ClientServiceForm
      clientId={id}
      onSaved={() => router.back()}
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  error: { ...typography.body, color: colors.onSurfaceVariant, textAlign: 'center' },
});
