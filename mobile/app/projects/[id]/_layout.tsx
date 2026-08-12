import { useCallback, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs, useFocusEffect } from 'expo-router';
import { HeaderBackButton } from '../../../src/components/ui/HeaderBackButton';
import { ProjectIdProvider } from '../../../src/context/ProjectIdContext';
import { getProject } from '../../../src/db/queries';
import { useAndroidBack } from '../../../src/hooks/useAndroidBack';
import { useProjectId } from '../../../src/hooks/useProjectId';
import { useTabBarInsets } from '../../../src/hooks/useTabBarInsets';
import { colors } from '../../../src/theme';

export default function ProjectDetailLayout() {
  const projectId = useProjectId();
  const [projectName, setProjectName] = useState('Project');
  const { tabBarStyle } = useTabBarInsets();

  useAndroidBack('/(tabs)/projects');

  const load = useCallback(async () => {
    if (!projectId) return;
    const project = await getProject(projectId);
    if (project?.name) setProjectName(project.name);
  }, [projectId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <ProjectIdProvider value={projectId}>
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '600', color: colors.onSurface },
        headerShadowVisible: false,
        headerLeft: () => <HeaderBackButton fallback="/(tabs)/projects" />,
        headerTitle: projectName,
        tabBarStyle: {
          ...tabBarStyle,
          backgroundColor: colors.surfaceContainerLowest,
          borderTopColor: colors.outlineVariant,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 0 },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="info" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="phases"
        options={{
          title: 'Phases',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="timeline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: 'Documents',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="folder" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Payments',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="payments" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="env"
        options={{
          title: 'Config',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="vpn-key" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="history" size={size} color={color} />,
        }}
      />
    </Tabs>
    </ProjectIdProvider>
  );
}
