import { useCallback, useState } from 'react';
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { ClientServiceForm } from '../../../src/components/forms/ClientServiceForm';
import { deleteClientService, getClientService } from '../../../src/db/queries';
import type { ClientService } from '../../../src/types';
import { colors, spacing, typography } from '../../../src/theme';

export default function EditClientServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [service, setService] = useState<ClientService | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    const row = await getClientService(Number(id));
    setService(row);
    setLoading(false);
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>This other service no longer exists.</Text>
      </View>
    );
  }

  return (
    <ClientServiceForm
      clientId={service.client_id}
      initial={service}
      onSaved={() => router.back()}
      onViewInvoice={(invoiceId) => router.push(`/invoices/${invoiceId}`)}
      onDelete={async () => {
        await deleteClientService(service.id);
        router.back();
      }}
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  error: { ...typography.body, color: colors.onSurfaceVariant, textAlign: 'center' },
});
