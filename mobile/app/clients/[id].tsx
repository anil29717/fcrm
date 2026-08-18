import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBadge } from '../../src/components/ui/StatusBadge';
import { ScreenLayout } from '../../src/components/ui/ScreenLayout';
import { getClient, getClientServices, getProjectsByClient } from '../../src/db/queries';
import type { Client, ClientService, Project } from '../../src/types';
import { formatCurrency, formatDate } from '../../src/utils/format';
import { colors, spacing, typography, radius } from '../../src/theme';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<ClientService[]>([]);
  const router = useRouter();

  const load = useCallback(async () => {
    const clientId = Number(id);
    const [c, p] = await Promise.all([getClient(clientId), getProjectsByClient(clientId)]);
    let s: ClientService[] = [];
    try {
      s = await getClientServices(clientId);
    } catch {
      s = [];
    }
    setClient(c);
    setProjects(p);
    setServices(s);
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!client) return null;

  return (
    <ScreenLayout>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{client.name.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{client.name}</Text>
        {client.status ? <Text style={styles.statusTag}>{client.status}</Text> : null}
        {client.email ? <Text style={styles.meta}>{client.email}</Text> : null}
        {client.phone ? <Text style={styles.meta}>{client.phone}</Text> : null}
        {client.address ? <Text style={styles.meta}>{client.address}</Text> : null}
        {client.notes ? <Text style={styles.notes}>{client.notes}</Text> : null}
        <TouchableOpacity style={styles.editBtn} onPress={() => router.push(`/clients/edit/${id}`)}>
          <MaterialIcons name="edit" size={16} color={colors.primary} />
          <Text style={styles.editText}>Edit Client</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Other services</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push({ pathname: '/clients/services/new', params: { clientId: id } })}
        >
          <MaterialIcons name="add" size={18} color={colors.onPrimary} />
          <Text style={styles.addBtnText}>Add work</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionHint}>
        One-off visits, fixes, or extra paid work that is not a full project.
      </Text>
      {services.length === 0 ? (
        <Text style={styles.empty}>No other services yet.</Text>
      ) : (
        services.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => router.push(`/clients/services/${item.id}`)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.projectName}>{item.title}</Text>
              <StatusBadge status={item.payment_status} />
            </View>
            <Text style={styles.type}>
              {formatDate(item.service_date)} · {formatCurrency(item.amount)}
              {item.invoice_number ? ` · ${item.invoice_number}` : ' · No invoice'}
            </Text>
          </TouchableOpacity>
        ))
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Projects</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push({ pathname: '/projects/new', params: { clientId: id } })}
        >
          <MaterialIcons name="add" size={18} color={colors.onPrimary} />
          <Text style={styles.addBtnText}>New Project</Text>
        </TouchableOpacity>
      </View>
      {projects.length === 0 ? (
        <Text style={styles.empty}>No projects for this client yet.</Text>
      ) : (
        projects.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => router.push(`/projects/${item.id}`)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.projectName}>{item.name}</Text>
              <StatusBadge status={item.status as 'in_progress' | 'completed' | 'on_hold'} />
            </View>
            {item.type ? <Text style={styles.type}>{item.type}</Text> : null}
          </TouchableOpacity>
        ))
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryContainer + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { ...typography.headline, color: colors.primary },
  name: { ...typography.title, color: colors.onSurface },
  meta: { ...typography.bodySm, color: colors.onSurfaceVariant },
  notes: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: spacing.sm, textAlign: 'center' },
  statusTag: { ...typography.caption, color: colors.primary, textTransform: 'capitalize', marginTop: 2 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: { ...typography.title, color: colors.onSurface },
  sectionHint: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.sm,
    marginTop: -4,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.lg,
    gap: 4,
  },
  addBtnText: { ...typography.label, color: colors.onPrimary },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  projectName: { ...typography.body, fontWeight: '600', color: colors.onSurface, flex: 1, marginRight: 8 },
  type: { ...typography.caption, color: colors.outline, marginTop: 4 },
  empty: { ...typography.bodySm, color: colors.onSurfaceVariant, textAlign: 'center', padding: spacing.md, marginBottom: spacing.md },
});
