import { useRouter, useLocalSearchParams } from 'expo-router';
import { ProjectForm } from '../../src/components/forms/ProjectForm';

function parseParamId(value?: string | string[]): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export default function NewProjectScreen() {
  const { clientId: preselectedClientId } = useLocalSearchParams<{ clientId?: string }>();
  const router = useRouter();
  return (
    <ProjectForm
      preselectedClientId={parseParamId(preselectedClientId)}
      onSaved={(id) => router.push(`/projects/${id}`)}
    />
  );
}
