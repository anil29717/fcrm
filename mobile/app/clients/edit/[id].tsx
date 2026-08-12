import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ClientForm } from '../../../src/components/forms/ClientForm';
import { getClient, getContactPersons } from '../../../src/db/queries';
import { colors } from '../../../src/theme';

export default function EditClientScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [initial, setInitial] = useState<Parameters<typeof ClientForm>[0]['initial']>();
  const router = useRouter();

  useEffect(() => {
    const clientId = Number(id);
    Promise.all([getClient(clientId), getContactPersons(clientId)]).then(([client, contacts]) => {
      if (!client) return;
      setInitial({
        id: client.id,
        name: client.name,
        client_type: client.client_type ?? undefined,
        gstin: client.gstin ?? undefined,
        address: client.address ?? undefined,
        lead_source: client.lead_source ?? undefined,
        status: client.status ?? 'active',
        tags: client.tags ? JSON.parse(client.tags) : [],
        phone: client.phone ?? undefined,
        email: client.email ?? undefined,
        notes: client.notes ?? undefined,
        contacts,
      });
    });
  }, [id]);

  if (!initial) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <ClientForm initial={initial} onSaved={() => router.back()} />;
}
