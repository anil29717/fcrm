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
import { StatusBadge } from '../../src/components/ui/StatusBadge';
import { ListScreenLayout } from '../../src/components/ui/ScreenLayout';
import { SearchField } from '../../src/components/ui/SearchField';
import { getProjects } from '../../src/db/queries';
import type { Project } from '../../src/types';
import { colors, spacing, typography, radius } from '../../src/theme';

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const load = useCallback(async () => {
    setProjects(await getProjects(search));
  }, [search]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    const timer = setTimeout(() => { load(); }, 300);
    return () => clearTimeout(timer);
  }, [search, load]);

  if (projects.length === 0 && !search) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="folder-open"
          title="No projects yet"
          description="Create a project from a client profile to get started."
          actionLabel="View Clients"
          onAction={() => router.push('/(tabs)/clients')}
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
          placeholder="Search projects..."
        />
      }
    >
      <FlatList
        data={projects}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/projects/${item.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.name}>{item.name}</Text>
              <StatusBadge status={item.status as 'in_progress' | 'completed' | 'on_hold'} />
            </View>
            <Text style={styles.client}>{item.client_name}</Text>
            {item.type ? <Text style={styles.type}>{item.type}</Text> : null}
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/projects/new')}>
        <MaterialIcons name="add" size={28} color={colors.onPrimary} />
      </TouchableOpacity>
    </ListScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.container, paddingBottom: spacing.xl + 72 },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { ...typography.body, fontWeight: '600', color: colors.onSurface, flex: 1 },
  client: { ...typography.bodySm, color: colors.onSurfaceVariant },
  type: { ...typography.caption, color: colors.outline, marginTop: 2 },
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
  },
});
