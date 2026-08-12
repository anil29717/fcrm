import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useFocusEffect } from 'expo-router';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { getTemplateBlocks, updateTemplateBlocks } from '../../src/db/queries';
import type { TemplateBlock } from '../../src/types';
import { colors, spacing, typography, radius } from '../../src/theme';

const BLOCK_LABELS: Record<string, string> = {
  company_details: 'Company Details',
  invoice_meta: 'Invoice Number & Date',
  client_details: 'Client / Contact Details',
  payment_details: 'Payment Details & Method',
  delivery_timeline: 'Delivery Timeline',
  signature: 'Signature',
};

export default function TemplateBuilderScreen() {
  const [blocks, setBlocks] = useState<TemplateBlock[]>([]);

  const load = useCallback(async () => {
    setBlocks(await getTemplateBlocks());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggleVisible = async (block: TemplateBlock) => {
    const updated = blocks.map((b) =>
      b.id === block.id ? { ...b, visible: b.visible ? 0 : 1 } : b,
    );
    setBlocks(updated);
    await updateTemplateBlocks(updated);
  };

  const onDragEnd = async ({ data }: { data: TemplateBlock[] }) => {
    const reordered = data.map((b, i) => ({ ...b, sort_order: i }));
    setBlocks(reordered);
    await updateTemplateBlocks(reordered);
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<TemplateBlock>) => (
    <ScaleDecorator>
      <TouchableOpacity
        onLongPress={drag}
        disabled={isActive}
        style={[styles.row, isActive && styles.rowActive]}
      >
        <MaterialIcons name="drag-handle" size={22} color={colors.outline} />
        <Text style={styles.rowTitle}>{BLOCK_LABELS[item.block_type] ?? item.block_type}</Text>
        <Switch
          value={!!item.visible}
          onValueChange={() => toggleVisible(item)}
          trackColor={{ true: colors.primaryContainer }}
        />
      </TouchableOpacity>
    </ScaleDecorator>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <DraggableFlatList
        data={blocks}
        keyExtractor={(item) => String(item.id)}
        onDragEnd={onDragEnd}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <Text style={styles.hint}>Long-press to reorder blocks. Toggle visibility with the switch.</Text>
            <View style={styles.preview}>
              <Text style={styles.previewTitle}>Live Preview</Text>
              {blocks.filter((b) => b.visible).map((b) => (
                <View key={b.id} style={styles.previewBlock}>
                  <Text style={styles.previewBlockTitle}>{BLOCK_LABELS[b.block_type]}</Text>
                  <View style={styles.previewPlaceholder} />
                </View>
              ))}
            </View>
            <Text style={styles.sectionTitle}>Template Blocks</Text>
          </>
        }
        ListFooterComponent={
          <Text style={styles.note}>Template config is stored locally only and is not included in cloud backup.</Text>
        }
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hint: { ...typography.caption, color: colors.onSurfaceVariant, paddingBottom: spacing.sm },
  preview: {
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: spacing.md,
  },
  previewTitle: { ...typography.label, color: colors.primary, marginBottom: spacing.sm },
  previewBlock: { marginBottom: spacing.sm },
  previewBlockTitle: { ...typography.caption, color: colors.onSurfaceVariant, marginBottom: 4 },
  previewPlaceholder: { height: 24, backgroundColor: colors.surfaceContainer, borderRadius: 4 },
  sectionTitle: { ...typography.title, fontSize: 15, color: colors.onSurface, marginBottom: spacing.sm },
  list: { padding: spacing.container, paddingBottom: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  rowActive: { opacity: 0.9, elevation: 4 },
  rowTitle: { ...typography.body, flex: 1, color: colors.onSurface },
  note: { ...typography.caption, color: colors.warning, textAlign: 'center', marginTop: spacing.md },
});
