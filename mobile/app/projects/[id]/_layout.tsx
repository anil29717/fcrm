import { Stack, useLocalSearchParams } from 'expo-router';
import { ProjectIdProvider } from '../../../src/context/ProjectIdContext';
import { useAndroidBack } from '../../../src/hooks/useAndroidBack';
import { stackScreen, stackScreenOptions } from '../../../src/navigation/screenOptions';

function parseProjectId(value?: string | string[]): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default function ProjectDetailLayout() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const projectId = parseProjectId(params.id);
  useAndroidBack('/(tabs)/projects');

  return (
    <ProjectIdProvider value={projectId}>
      <Stack screenOptions={stackScreenOptions}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="phase/[phaseId]" options={stackScreen('Phase Detail')} />
      </Stack>
    </ProjectIdProvider>
  );
}
