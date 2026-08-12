import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';
import { Card } from '../../../src/components/ui/Card';
import { ScreenLayout } from '../../../src/components/ui/ScreenLayout';
import { getProject } from '../../../src/db/queries';
import type { Project } from '../../../src/types';
import { useProjectId } from '../../../src/hooks/useProjectId';
import { formatCurrency } from '../../../src/utils/format';
import { colors, spacing, typography, radius } from '../../../src/theme';

export default function ProjectOverviewScreen() {
  const projectId = useProjectId();
  const id = String(projectId ?? '');
  const [project, setProject] = useState<Project | null>(null);
  const router = useRouter();

  useFocusEffect(useCallback(() => {
    if (!projectId) return;
    getProject(projectId).then(setProject);
  }, [projectId]));

  if (!project) return null;

  return (
    <ScreenLayout contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.name}>{project.name}</Text>
        <StatusBadge status={project.status} />
      </View>
      <Text style={styles.client}>{project.client_name}</Text>
      <TouchableOpacity style={styles.editBtn} onPress={() => router.push(`/projects/edit/${id}`)}>
        <MaterialIcons name="edit" size={16} color={colors.primary} />
        <Text style={styles.editText}>Edit Project</Text>
      </TouchableOpacity>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Project Value</Text>
        <Text style={styles.cardBody}>{formatCurrency(project.project_value ?? 0)}</Text>
        {project.billing_type ? <Text style={styles.cardMeta}>Billing: {project.billing_type}</Text> : null}
        {project.priority ? <Text style={styles.cardMeta}>Priority: {project.priority}</Text> : null}
      </Card>

      {project.description ? (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Description</Text>
          <Text style={styles.cardBody}>{project.description}</Text>
        </Card>
      ) : null}

      {project.website_url ? (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Website URL</Text>
          <Text style={styles.link}>{project.website_url}</Text>
        </Card>
      ) : null}

      {project.type ? (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Type</Text>
          <Text style={styles.cardBody}>{project.type}</Text>
        </Card>
      ) : null}

      {project.credentials_encrypted ? (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Credentials</Text>
          <Text style={styles.cardBody}>•••••••• (see Config tab)</Text>
        </Card>
      ) : null}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4 },
  name: { ...typography.headline, fontSize: 22, color: colors.onSurface, flex: 1 },
  client: { ...typography.bodySm, color: colors.onSurfaceVariant, marginBottom: spacing.sm },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginBottom: spacing.lg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.primary },
  editText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  card: { marginBottom: spacing.md },
  cardTitle: { ...typography.title, fontSize: 16, color: colors.onSurface, marginBottom: spacing.sm },
  cardBody: { ...typography.bodySm, color: colors.onSurfaceVariant },
  cardMeta: { ...typography.caption, color: colors.outline, marginTop: 4 },
  link: { ...typography.bodySm, color: colors.primary },
});
