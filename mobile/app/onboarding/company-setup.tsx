import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '../../src/components/ui/Button';
import { ScreenLayout } from '../../src/components/ui/ScreenLayout';
import { BusinessProfileFields, type BusinessProfileFormState } from '../../src/components/forms/BusinessProfileFields';
import { saveCompany } from '../../src/db/queries';
import { useAuth } from '../../src/context/AuthContext';
import { copyToAppStorage, getCompanyAssetsDir } from '../../src/utils/files';
import { colors, spacing, typography } from '../../src/theme';

const INITIAL: BusinessProfileFormState = {
  name: '',
  short_code: '',
  owner_name: '',
  address: '',
  currency: 'INR',
  financial_year_start_month: 4,
  logo_path: null,
};

export default function CompanySetupScreen() {
  const [form, setForm] = useState<BusinessProfileFormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const { refreshOnboarding } = useAuth();
  const router = useRouter();

  const pickLogo = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Allow photo access to upload your logo');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const dest = `${getCompanyAssetsDir()}logo_${Date.now()}.jpg`;
      const saved = await copyToAppStorage(result.assets[0].uri, dest);
      setForm((f) => ({ ...f, logo_path: saved }));
    } catch (e) {
      Alert.alert('Upload failed', e instanceof Error ? e.message : 'Could not upload logo');
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Required', 'Business name is required');
      return;
    }
    if (!form.short_code.trim() || form.short_code.length < 2) {
      Alert.alert('Required', 'Company short code must be at least 2 characters');
      return;
    }
    if (!form.email?.trim()) {
      Alert.alert('Required', 'Email is required');
      return;
    }
    if (!form.phone?.trim()) {
      Alert.alert('Required', 'Phone is required');
      return;
    }
    if (!form.business_type) {
      Alert.alert('Required', 'Select a business type');
      return;
    }
    setLoading(true);
    try {
      await saveCompany({
        ...form,
        name: form.name.trim(),
        short_code: form.short_code.trim(),
        logo_path: form.logo_path ?? undefined,
      });
      await refreshOnboarding();
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save company profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout>
      <View style={styles.header}>
        <MaterialIcons name="storefront" size={32} color={colors.primary} />
        <Text style={styles.headerTitle}>Set up your business</Text>
        <Text style={styles.headerSub}>Complete your business profile for invoices and clients</Text>
      </View>
      <BusinessProfileFields values={form} onChange={(p) => setForm((f) => ({ ...f, ...p }))} onPickLogo={pickLogo} />
      <Button title="Continue to Dashboard" onPress={handleSave} loading={loading} />
      <Button
        title="Restore from backup file instead"
        onPress={() => router.replace('/onboarding/restore')}
        variant="ghost"
        style={styles.restoreLink}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: spacing.lg },
  headerTitle: { ...typography.title, color: colors.onSurface, marginTop: spacing.sm },
  headerSub: { ...typography.bodySm, color: colors.onSurfaceVariant, textAlign: 'center' },
  restoreLink: { marginTop: spacing.md },
});
