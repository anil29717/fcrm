import { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { ListScreenLayout } from '../../src/components/ui/ScreenLayout';
import { SearchField } from '../../src/components/ui/SearchField';
import { getClients } from '../../src/db/queries';
import type { Client } from '../../src/types';
import { colors, spacing, typography, radius } from '../../src/theme';

export default function ClientsScreen() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const load = useCallback(async () => {
    setClients(await getClients(search));
  }, [search]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    const timer = setTimeout(() => { load(); }, 300);
    return () => clearTimeout(timer);
  }, [search, load]);

  if (clients.length === 0 && !search) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="group"
          title="No clients yet"
          description="Add your first client to start managing projects and invoices."
          actionLabel="Add Client"
          onAction={() => router.push('/clients/new')}
        />
      </View>
    );
  }

  return (
    <ListScreenLayout
      fixedTop={
        <SearchField
          value={search}
          onChangeText={setSearch}
          onSubmit={load}
          placeholder="Search clients..."
        />
      }
    >
      <FlatList
        data={clients}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/clients/${item.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.name}>{item.name}</Text>
              {item.email ? <Text style={styles.meta}>{item.email}</Text> : null}
              {item.phone ? <Text style={styles.meta}>{item.phone}</Text> : null}
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.project_count ?? 0} projects</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/clients/new')}>
        <MaterialIcons name="add" size={28} color={colors.onPrimary} />
      </TouchableOpacity>
    </ListScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.container, paddingBottom: spacing.xl + 72 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryContainer + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { ...typography.title, color: colors.primary, fontSize: 18 },
  cardBody: { flex: 1 },
  name: { ...typography.body, fontWeight: '600', color: colors.onSurface },
  meta: { ...typography.caption, color: colors.onSurfaceVariant },
  badge: {
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeText: { ...typography.caption, color: colors.onSurfaceVariant },
  fab: {
    position: 'absolute',
    right: spacing.container,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
