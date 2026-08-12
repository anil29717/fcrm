import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ProjectForm } from '../../../src/components/forms/ProjectForm';
import { getProject } from '../../../src/db/queries';
import type { Project } from '../../../src/types';
import { colors } from '../../../src/theme';

export default function EditProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [initial, setInitial] = useState<Parameters<typeof ProjectForm>[0]['initial']>();
  const router = useRouter();

  useEffect(() => {
    getProject(Number(id)).then((p: Project | null) => {
      if (!p) return;
      setInitial({
        id: p.id,
        client_id: p.client_id,
        name: p.name,
        type: p.type ?? undefined,
        description: p.description ?? undefined,
        website_url: p.website_url ?? undefined,
        start_date: p.start_date ?? undefined,
        end_date: p.end_date ?? undefined,
        priority: p.priority ?? undefined,
        billing_type: p.billing_type ?? 'fixed',
        project_value: p.project_value,
        hourly_rate: p.hourly_rate ?? undefined,
        status: p.status,
        tags: p.tags ? JSON.parse(p.tags) : [],
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

  return <ProjectForm initial={initial} onSaved={() => router.back()} />;
}
