import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';
import { HeaderBackButton } from '../src/components/ui/HeaderBackButton';
import { stackScreen, stackScreenNoBack, stackScreenOptions } from '../src/navigation/screenOptions';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={stackScreenOptions}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="auth/create-pin" options={{ headerShown: false }} />
            <Stack.Screen
              name="auth/confirm-pin"
              options={stackScreen('Confirm PIN', {
                headerLeft: () => <HeaderBackButton fallback="/auth/create-pin" />,
              })}
            />
            <Stack.Screen name="auth/enter-pin" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/restore-choice" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/restore" options={stackScreen('Restore Backup')} />
            <Stack.Screen name="onboarding/company-setup" options={stackScreenNoBack('Company Setup')} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="clients/new" options={stackScreen('New Client')} />
            <Stack.Screen name="clients/edit/[id]" options={stackScreen('Edit Client')} />
            <Stack.Screen name="clients/[id]" options={stackScreen('Client Details')} />
            <Stack.Screen name="projects/new" options={stackScreen('New Project')} />
            <Stack.Screen name="projects/edit/[id]" options={stackScreen('Edit Project')} />
            <Stack.Screen name="projects/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="invoices/create" options={stackScreen('Create Invoice')} />
            <Stack.Screen name="invoices/[id]" options={stackScreen('Invoice')} />
            <Stack.Screen name="settings/backup" options={stackScreen('Export & Restore')} />
            <Stack.Screen name="settings/backup-config" options={stackScreen('Backup API Config')} />
            <Stack.Screen name="settings/template-builder" options={stackScreen('Invoice Template')} />
            <Stack.Screen name="settings/business-profile" options={stackScreen('Business Profile')} />
            <Stack.Screen name="settings/invoice-numbering" options={stackScreen('Invoice Numbering')} />
            <Stack.Screen name="settings/change-pin" options={stackScreen('Change PIN')} />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
