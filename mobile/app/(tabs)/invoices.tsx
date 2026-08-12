import { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { StatusBadge } from '../../src/components/ui/StatusBadge';
import { ListScreenLayout } from '../../src/components/ui/ScreenLayout';
import { SearchField } from '../../src/components/ui/SearchField';
import { getInvoices } from '../../src/db/queries';
import type { Invoice } from '../../src/types';
import { formatCurrency, formatDate } from '../../src/utils/format';
import { colors, spacing, typography, radius } from '../../src/theme';

export default function InvoicesScreen() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const load = useCallback(async () => {
    try {
      setInvoices(await getInvoices(search));
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to load invoices');
    }
  }, [search]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    const timer = setTimeout(() => { load(); }, 300);
    return () => clearTimeout(timer);
  }, [search, load]);

  const openNewInvoice = () => {
    try {
      router.push('/invoices/new');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not open invoice form');
    }
  };

  if (invoices.length === 0 && !search) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="receipt-long"
          title="No invoices yet"
          description="Create your first invoice for a project."
          actionLabel="New Invoice"
          onAction={openNewInvoice}
        />
        <TouchableOpacity style={styles.fab} onPress={openNewInvoice}>
          <MaterialIcons name="add" size={28} color={colors.onPrimary} />
        </TouchableOpacity>
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
          placeholder="Search invoices..."
        />
      }
    >
      <FlatList
        data={invoices}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/invoices/${item.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.number}>{item.invoice_number}</Text>
              <StatusBadge status={item.status as 'paid' | 'pending' | 'partial' | 'overdue'} />
            </View>
            <Text style={styles.project}>{item.project_name} — {item.client_name}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.date}>{formatDate(item.date)}</Text>
              <Text style={styles.total}>{formatCurrency(item.total)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={openNewInvoice}>
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  number: { ...typography.body, fontWeight: '600', color: colors.onSurface },
  project: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  date: { ...typography.caption, color: colors.outline },
  total: { ...typography.body, fontWeight: '600', color: colors.primary },
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
